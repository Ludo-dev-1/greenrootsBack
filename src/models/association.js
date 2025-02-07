import sequelize from "../database.js";
import { Article } from "./Article.js";
import { Order } from "./Order.js";
import { Category } from "./Category.js";
import { Picture } from "./Picture.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { Tracking } from "./Tracking.js";
import { ArticleHasOrder } from "./ArticleHasOrder.js";
import { ArticleHasCategory } from "./ArticleHasCategory.js";

// User <=> Role (One-to-Many)
User.belongsTo(Role, {foreignKey: "role_id"});
Role.hasMany(User, {foreignKey: "role_id"});

// Article <=> Picture (One-to-Many)
Article.belongsTo(Picture, {foreignKey: "picture_id"});
Picture.hasMany(Article, {foreignKey: "picture_id"});

// Order <=> User (One-to-Many)
Order.belongsTo(User, {foreignKey: "user_id"});
User.hasMany(Order, {foreignKey: "user_id"});

// Tracking <=> Picture (One-to-Many)
Tracking.belongsTo(Picture, {foreignKey: "picture_id"});
Picture.hasMany(Tracking, {foreignKey: "picture_id"});

// Tracking <=> Order (One-to-Many)
Tracking.belongsTo(Order, {foreignKey: "order_id"});
Order.hasMany(Tracking, {foreignKey: "order_id"});

// Article <=> Category
// Relation Many-to-Many
Article.belongsToMany(Category, {
    as: "categories",
    through: ArticleHasCategory,
    foreignKey: "article_id",
    otherKey: "category_id"
});
Category.belongsToMany(Article, {
    as: "articles",
    through: ArticleHasCategory,
    foreignKey: "category_id",
    otherKey: "article_id"
});

// Article <=> Order
// Relation Many-to-Many
Article.belongsToMany(Order, {
    as: "orders",
    through: ArticleHasOrder,
    foreignKey: "article_id",
    otherKey: "order_id"
});
Order.belongsToMany(Article, {
    as: "articles",
    through: ArticleHasOrder,
    foreignKey: "order_id",
    otherKey: "article_id"
});

export { Category, Role, Picture, User, Article, Order, Tracking, ArticleHasOrder, ArticleHasCategory, sequelize };