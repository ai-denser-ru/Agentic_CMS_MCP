import { z } from "zod";
export declare const NodeSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<{
        menu_item: "menu_item";
        class: "class";
        news: "news";
    }>>;
    image: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    taxonomies: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const PageSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    layout: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    draft: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const BlockSchema: z.ZodObject<{
    title: z.ZodString;
    block_type: z.ZodDefault<z.ZodEnum<{
        promo: "promo";
        testimonial: "testimonial";
        cta: "cta";
    }>>;
    placement: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    weight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const TaxonomySchema: z.ZodObject<{
    title: z.ZodString;
    vocabulary: z.ZodDefault<z.ZodEnum<{
        category: "category";
        level: "level";
        tag: "tag";
    }>>;
    weight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const StaffSchema: z.ZodObject<{
    title: z.ZodString;
    role: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const SettingsArgsSchema: z.ZodObject<{
    setting_type: z.ZodEnum<{
        business: "business";
        navigation: "navigation";
        site: "site";
    }>;
    locale: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateSettingsArgsSchema: z.ZodObject<{
    setting_type: z.ZodEnum<{
        business: "business";
        navigation: "navigation";
        site: "site";
    }>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodAny;
}, z.core.$strip>;
export declare const NodeToolArgsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        menu_item: "menu_item";
        class: "class";
        news: "news";
    }>>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const PageToolArgsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const BlockToolArgsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const TaxonomyToolArgsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const StaffToolArgsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map