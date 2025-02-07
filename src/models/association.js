import sequelize from "../database.js";
import { Article } from "./Article.js";
import { Order } from "./Order.js";
import { Category } from "./Category.js";
import { Picture } from "./Picture.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { Tracking } from "./Tracking.js";

// User <=> Role
User.belongsTo(Role, {foreignKey: "role_id"});
Role.hasMany(User, {foreignKey: "role_id"});

// Article <=> Picture
Article.belongsTo(Picture, {foreignKey: "picture_id"});
Picture.hasMany(Article, {foreignKey: "picture_id"});

// Order <=> User
Order.belongsTo(User, {foreignKey: "user_id"});
User.hasMany(Order, {foreignKey: "user_id"});

// Tracking <=> Picture
Tracking.belongsTo(Picture, {foreignKey: "picture_id"});
Picture.hasMany(Tracking, {foreignKey: "picture_id"});

// Tracking <=> Order
Tracking.belongsTo(Order, {foreignKey: "order_id"});
Order.hasMany(Tracking, {foreignKey: "order_id"});

// Article <=> Category
Article.belongsToMany(Category, {
    as: "categories",
    through: "article_has_category",
    foreignKey: "article_id",
    otherKey: "category_id"
});
Category.belongsToMany(Article, {
    as: "articles",
    through: "article_has_category",
    foreignKey: "category_id",
    otherKey: "article_id"
});

// Article <=> Order
Article.belongsToMany(Order, {
    as: "orders",
    through: "article_has_order",
    foreignKey: "article_id",
    otherKey: "order_id"
});
Order.belongsToMany(Article, {
    as: "articles",
    through: "article_has_order",
    foreignKey: "order_id",
    otherKey: "article_id"
});

export { Category, Role, Picture, User, Article, Order, Tracking, sequelize };