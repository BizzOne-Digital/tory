import mongoose, { type Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { connectDB } from "@/lib/db/connect";
import {
  applyPercentDiscount,
  calcLineTotal,
  sumMoney,
  type MoneyMinor,
} from "@/lib/money";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/order";
import { Order, Product, SiteSettings } from "@/models";
import type { ImageMeta } from "@/models/shared";

type ProductVariant = {
  _id: Types.ObjectId;
  name: string;
  options?: string[];
  sku?: string;
  priceOverrideMinor?: number;
  inventory?: number;
};

type ProductSnapshot = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  priceMinor: number;
  seasonal?: boolean;
  inventory?: number;
  images?: ImageMeta[];
  variants?: ProductVariant[];
};

const orderSuffix = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

type ResolvedLine = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  variantLabel: string;
  unitPriceMinor: MoneyMinor;
  quantity: number;
  lineTotalMinor: MoneyMinor;
  imageUrl: string;
  seasonal: boolean;
  variantId?: Types.ObjectId;
};

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `LC-${date}-${orderSuffix()}`;
}

function buildVariantLabel(variant: {
  name: string;
  options?: string[];
}) {
  if (variant.options?.length) {
    return `${variant.name}: ${variant.options.join(" / ")}`;
  }
  return variant.name;
}

function resolveVariant(
  product: ProductSnapshot,
  variantLabel: string,
): ProductVariant | null {
  if (!variantLabel || !product.variants?.length) {
    return null;
  }

  return (
    product.variants.find((variant) => {
      const label = buildVariantLabel(variant);
      return variantLabel === label || variantLabel === variant.name;
    }) ?? null
  );
}

function getUnitPriceMinor(
  product: ProductSnapshot,
  variant: ProductVariant | null,
): MoneyMinor {
  if (variant?.priceOverrideMinor != null) {
    return variant.priceOverrideMinor;
  }
  return product.priceMinor;
}

function getAvailableInventory(
  product: ProductSnapshot,
  variant: ProductVariant | null,
): number {
  if (variant) {
    return variant.inventory ?? 0;
  }
  return product.inventory ?? 0;
}

function isSeasonalOfferActive(settings: {
  seasonalOffer?: {
    active?: boolean;
    startDate?: Date;
    endDate?: Date;
  };
}) {
  const offer = settings.seasonalOffer;
  if (!offer?.active) return false;

  const now = Date.now();
  if (offer.startDate && new Date(offer.startDate).getTime() > now) {
    return false;
  }
  if (offer.endDate && new Date(offer.endDate).getTime() < now) {
    return false;
  }
  return true;
}

export class CreateOrderError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CreateOrderError";
    this.status = status;
  }
}

export async function createOrder(input: CheckoutInput) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new CreateOrderError(
      parsed.error.issues[0]?.message ?? "Invalid order data",
    );
  }

  const data = parsed.data;
  await connectDB();

  const productIds = [...new Set(data.items.map((item) => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    status: "published",
  }).lean<ProductSnapshot[]>();

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const resolvedLines: ResolvedLine[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new CreateOrderError("One or more products are unavailable", 404);
    }

    const variant = resolveVariant(product, item.variantLabel);
    if (item.variantLabel && product.variants?.length && !variant) {
      throw new CreateOrderError(
        `Selected variant is unavailable for ${product.name}`,
      );
    }

    const available = getAvailableInventory(product, variant);
    if (available < item.quantity) {
      throw new CreateOrderError(
        `Insufficient inventory for ${product.name}`,
        409,
      );
    }

    const unitPriceMinor = getUnitPriceMinor(product, variant);
    const imageUrl = product.images?.[0]?.url ?? "";

    resolvedLines.push({
      productId: String(product._id),
      slug: product.slug,
      name: product.name,
      sku: variant?.sku || product.sku,
      variantLabel: item.variantLabel,
      unitPriceMinor,
      quantity: item.quantity,
      lineTotalMinor: calcLineTotal(unitPriceMinor, item.quantity),
      imageUrl,
      seasonal: Boolean(product.seasonal),
      variantId: variant?._id,
    });
  }

  const settings =
    (await SiteSettings.findOne({ key: "default" }).lean()) ??
    (await SiteSettings.findOne().lean());

  const currency = settings?.currency ?? "USD";
  const subtotalMinor = sumMoney(
    resolvedLines.map((line) => line.lineTotalMinor),
  );

  let discountMinor = 0;
  let discountLabel = "";
  let totalMinor = subtotalMinor;

  if (settings && isSeasonalOfferActive(settings)) {
    const seasonalSubtotal = sumMoney(
      resolvedLines
        .filter((line) => line.seasonal)
        .map((line) => line.lineTotalMinor),
    );

    if (seasonalSubtotal > 0) {
      const percent = settings.seasonalOffer?.discountPercent ?? 0;
      const discountResult = applyPercentDiscount(seasonalSubtotal, percent);
      discountMinor = discountResult.discountMinor;
      discountLabel = settings.seasonalOffer?.text ?? "Seasonal courtesy";
      totalMinor = Math.max(0, subtotalMinor - discountMinor);
    }
  }

  const orderNumber = generateOrderNumber();
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const line of resolvedLines) {
        if (line.variantId) {
          const updated = await Product.updateOne(
            {
              _id: line.productId,
              status: "published",
              variants: {
                $elemMatch: {
                  _id: line.variantId,
                  inventory: { $gte: line.quantity },
                },
              },
            },
            { $inc: { "variants.$.inventory": -line.quantity } },
            { session },
          );

          if (updated.modifiedCount !== 1) {
            throw new CreateOrderError(
              `Insufficient inventory for ${line.name}`,
              409,
            );
          }
          continue;
        }

        const updated = await Product.updateOne(
          {
            _id: line.productId,
            status: "published",
            inventory: { $gte: line.quantity },
          },
          { $inc: { inventory: -line.quantity } },
          { session },
        );

        if (updated.modifiedCount !== 1) {
          throw new CreateOrderError(
            `Insufficient inventory for ${line.name}`,
            409,
          );
        }
      }

      await Order.create(
        [
          {
            orderNumber,
            customer: data.customer,
            shipping: data.shipping,
            items: resolvedLines.map(
              ({
                productId,
                slug,
                name,
                sku,
                variantLabel,
                unitPriceMinor,
                quantity,
                lineTotalMinor,
                imageUrl,
              }) => ({
                productId,
                slug,
                name,
                sku,
                variantLabel,
                unitPriceMinor,
                quantity,
                lineTotalMinor,
                imageUrl,
              }),
            ),
            currency,
            subtotalMinor,
            discountMinor,
            discountLabel,
            shippingMinor: 0,
            totalMinor,
            status: "pending",
            payment: {
              provider: "manual",
              status: "pending",
              reference: "",
            },
            statusHistory: [
              {
                status: "pending",
                note: "Order submitted — payment pending",
                at: new Date(),
                by: "system",
              },
            ],
          },
        ],
        { session },
      );
    });

    return {
      orderNumber,
      subtotalMinor,
      discountMinor,
      discountLabel,
      totalMinor,
      currency,
    };
  } finally {
    await session.endSession();
  }
}
