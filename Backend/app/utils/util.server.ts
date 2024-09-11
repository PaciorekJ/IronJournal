
type AllCombinations<T> = T extends object
  ? Record<string, any> | { [K in keyof T]: T[K] } & { [K in keyof T]?: AllCombinations<Omit<T, K>> }
  : never;


type IFieldConfigBase = {
  isArray: boolean;
  constructor: (value: string) => any;
  regex: (value: string) => RegExp;
};

type IFieldConfig = AllCombinations<IFieldConfigBase>;

type IQueryField<T> =
  | T
  | { $in: T[] }
  | { $all: T[] }
  | { $regex: RegExp }
  | { $eq: T };

type IQuery<T> = {
  [K in keyof T]?: IQueryField<T[K]>;
};

type IBuildQueryConfig = Record<string, IFieldConfig>

/**
 * Builds a query object from a Request object based on a configuration of keys and their corresponding types.
 * @param {Request} request The request object to build the query from.
 * @param {IBuildQueryConfig} config A configuration object that maps keys to their corresponding types.
 * @returns {{ query: IQuery<T>, limit: number, offset: number, sortBy: string | undefined, sortOrder: number }} An object containing the query object, limit, offset, sortBy, and sortOrder.
 */
export const buildQueryFromRequest = <T>(
  request: Request,
  config: Record<string, IFieldConfig>
) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const query: IQuery<T> = {};

  Object.entries(config).forEach(([key, fieldConfig]) => {
    const { isArray = false, constructor = (value: string) => value, regex = null } =
      fieldConfig || {}; // Default constructor is an identity function
    const paramValue = searchParams.get(key);

    if (paramValue) {
      if (isArray) {
        const arrayValue = paramValue
          .split(',')
          .map((value) => constructor(value.trim())) as unknown[];

        if (arrayValue.length > 0) {
          query[key as keyof T] = { $in: arrayValue } as IQueryField<T[keyof T]>;
        }
      } else {
        const value = constructor(paramValue.trim());
        if (regex && typeof value === 'string') {
          query[key as keyof T] = { $regex: regex(value) } as IQueryField<T[keyof T]>;
        } else {
          query[key as keyof T] = value as IQueryField<T[keyof T]>;
        }
      }
    }
  });

  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const sortBy = searchParams.get('sortBy') as string;
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;

  return { query, limit, offset, sortBy, sortOrder };
};

export function buildPopulateOptions(searchParams: URLSearchParams, key: string): any[] {
  const populate = searchParams.get(key);
  if (!populate) return [];

  const fieldsToPopulate = Array.from(new Set(populate.split(",").map((field) => field.trim()))); // Remove duplicates

  return fieldsToPopulate.map((field) => {
    const [path, selectFields] = field.includes("(")
      ? [field.split("(")[0], field.match(/\((.*)\)/)?.[1].replace(")", "")]
      : [field, null];

    return {
      path: path.trim(),
      select: selectFields
        ? selectFields
            .split(",")
            .map((f) => f.trim())
            .join(" ")
        : undefined,
    };
  });
}

export type { IBuildQueryConfig, IFieldConfig, IQuery, IQueryField };

