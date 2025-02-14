import sequelize from "../database.js";
import { Article } from "./Article.js";
import { Order } from "./Order.js";
import { Category } from "./Category.js";
import { Picture } from "./Picture.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { Tracking } from "./Tracking.js";
import { ArticleTracking } from "./ArticleTracking.js";
import { ArticleHasOrder } from "./ArticleHasOrder.js";
import { ArticleHasCategory } from "./ArticleHasCategory.js";

// One-to-One associations
// Tracking <=> Order (One-to-One)
Tracking.belongsTo(Order, { foreignKey: "order_id" });
Order.hasOne(Tracking, { foreignKey: "order_id" });

// One-to-Many associations
// User <=> Role (One-to-Many)
User.belongsTo(Role, {foreignKey: "role_id"});
Role.hasMany(User, {foreignKey: "role_id"});

// Article <=> Picture (One-to-Many)
Article.belongsTo(Picture, {
    foreignKey: "picture_id",
    onDelete: "CASCADE"
});
Picture.hasMany(Article, {foreignKey: "picture_id", onDelete: "CASCADE"});

// Order <=> User (One-to-Many)
Order.belongsTo(User, {foreignKey: "user_id"});
User.hasMany(Order, {foreignKey: "user_id"});

// ArticleTracking <=> ArticleHasOrder (One-to-Many)
ArticleTracking.belongsTo(ArticleHasOrder, { foreignKey: "article_has_order_id" });
ArticleHasOrder.hasMany(ArticleTracking, { foreignKey: "article_has_order_id" });

// ArticleTracking <=> Picture (One-To-Many)
ArticleTracking.belongsTo(Picture, { foreignKey: "picture_id" });
Picture.hasMany(ArticleTracking, { foreignKey: "picture_id" });

// Article <=> ArticleTracking (One-to-Many)
Article.hasMany(ArticleTracking, { foreignKey: "article_id" });
ArticleTracking.belongsTo(Article, { foreignKey: "article_id" });

// Order <=> ArticleHasOrder (One-to-Many)
Order.hasMany(ArticleHasOrder, { foreignKey: 'order_id' });
ArticleHasOrder.belongsTo(Order, { foreignKey: 'order_id' });

// Article <=> ArticleHasOrder (One-to-Many)
Article.hasMany(ArticleHasOrder, { foreignKey: 'article_id' });
ArticleHasOrder.belongsTo(Article, { foreignKey: 'article_id' });

// Many-to-Many associations
// Article <=> Category (Many-to-Many)
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

// Article <=> Order (Many-to-Many)
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

export { Category, Role, Picture, User, Article, Order, Tracking, ArticleTracking, ArticleHasCategory, ArticleHasOrder, sequelize };
