# Documentation de l'API GreenRoots

## Introduction

GreenRoots est une API permettant de gérer une plateforme de vente d'arbres et de suivi de plantation. Elle offre des fonctionnalités pour les utilisateurs, les commandes et l'administration des articles.

## Guide de démarrage

### Base URL

Toutes les requêtes doivent être envoyées à : `http://localhost:3000`

### Authentification

L'API utilise l'authentification JWT. Inclure le token dans le header des requêtes API :
`Authorization: Bearer <votre_token_jwt>`

## Points d'accès (Endpoints)

Les "?" dans la documentation indiquent que le champ est optionnel.

### Utilisateurs

#### Afficher le formulaire d'inscription

- **GET** `/inscription`
- Réponse: `{ message: "Formulaire d'inscription" }`

#### Inscription

- **POST** `/inscription`
- Body: `{ "firstname": "string", "lastname": "string", "email": "string", "password": "string", "repeat_password": "string" }`
- Réponse: `{ message: "Utilisateur créé avec succès", "user": { "id": "number", "firstname": "string", "lastname": "string", "email": "string" } }`

#### Vérification de l'email

- **GET** `/verification/:verifyToken`
- Réponse: `{ message: "Votre email a bien été validé." }`

#### Afficher le formulaire de connexion

- **GET** `/connexion`
- Réponse: `{ message: "Formulaire de connexion" }`

#### Connexion

- **POST** `/connexion`
- Body: `{ "email": "string", "password": "string" }`
- Réponse: `{ "message": "Connexion réussie", "token": "string" }`

#### Afficher le formulaire de mot de passe oublié

- **GET** `/mot-de-passe-oublie`
- Réponse: `{ message: "Mot de passe oublié ?" }`

#### Demande de réinitialisation de mot de passe

- **POST** `/mot-de-passe-oublie`
- Body: `{ "email": "string" }`
- Réponse: `{ message: "Un email de réinitialisation a été envoyé à votre adresse email." }`

#### Afficher le formulaire de réinitialisation de mot de passe

- **GET** `/changement-mot-de-passe/:token`
- Réponse: `{ message: "Changement de mot de passe" }`

#### Réinitialisation du mot de passe

- **POST** `/changement-mot-de-passe/:token`
- Body: `{ "newPassword": "string", "repeat_password": "string" }`
- Réponse: `{ message: "Mot de passe modifié avec succès" }`

#### Récupérer le profil utilisateur

- **GET** `/compte`
- Réponse: `{ "firstname": "string", "lastname": "string", "email": "string", "created_at": "date", "updated_at": "date" }`

#### Mettre à jour le profil utilisateur

- **PATCH** `/compte`
- Body: `{ "firstname?": "string", "lastname?": "string", "email?": "string", "password?": "string", "repeat_password?": "string" }`
- Réponse: `{ "message": "Profil mis à jour avec succès", "user": { "id": "number", "firstname": "string", "lastname": "string", "email": "string", "created_at": "date", "updated_at": "date" } }`

#### Supprimer le compte utilisateur

- **DELETE** `/compte`
- Réponse: `message: "Profil utilisateur et données associées supprimés avec succès" }`

### Articles

#### Récupérer les nouveaux articles (page d'accueil)

- **GET** `/`
- Réponse: `{ "articles": [{ "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "Picture": { "id": "number", "url": "string" } }] }`

#### Récupérer tous les articles

- **GET** `/boutique`
- Réponse: `{ "articles": [{ "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "Picture": { "id": "number", "url": "string" }, "categories": [{ "id": "number", "name": "string" }] }] }`

#### Récupérer un article spécifique

- **GET** `/boutique/article/:id`
- Réponse: `{ "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "Picture": { "id": "number", "url": "string" }}`

### Commandes

#### Afficher la page de commande

- **GET** `/commande`
- Réponse: `{ message: "Pages de commandes" }`

#### Passer une commande

- **POST** `/commande`
- Body: `{ "articles": [{ "id": "number", "quantity": "number", "stripe_price_id?": "string" }] }`
- Réponse: `{ "message": "Commande créée avec succès", "order": { "id": "number", "sessionStripeId": "string" }, "articleDetails": [{ "name": "string", "quantity": "number", "price": "number", "stripe_price_id": "string", "id": "number" }] }`

#### Récupérer les commandes de l'utilisateur

- **GET** `/compte/commandes`
- Réponse: `[{ "id": "number", "article_summary": "string", "date": "date", "total_price": "number" }]`

#### Récupérer les détails d'une commande

- **GET** `/compte/commandes/:id`
- Réponse: `{ "id": "number", "article_summary": "string", "date": "date", "total_price": "number", "articles": [{ "id": "number", "name": "string", "price": "number", "quantity": "number" }] }`

#### Récupérer le suivi d'une commande

- **GET** `/compte/commandes/:id/suivi`
- Réponse: `{ "id": "number", "status": "string", "articles": [{ "id": "number", "name": "string", "ArticleTrackings": [{ "status": "string", "growth": "string", "plant_place": "string", "Picture": { "id": "number", "url": "string" } }] }] }`

#### Récupérer le suivi d'un article spécifique d'une commande

- **GET** `/compte/commandes/:orderId/suivi/:articleTrackingId`
- Réponse: `{ "id": "number", "status": "string", "growth": "string", "plant_place": "string", "nickname": "string", "Picture": { "id": "number", "url": "string" } }`

#### Mettre à jour le nom d'un article dans le suivi

- **PATCH** `/compte/commandes/:orderId/suivi/:articleTrackingId`
- Body: `{ "nickname": "string" }`
- Réponse: `{ "message": "Nom personnalisé de l'article mis à jour avec succès", "articleTracking": { "id": "number", "nickname": "string" } }`

### Administration (requiert des droits admin)

#### Récupérer tous les articles (admin)

- **GET** `/api/articles`
- Réponse: `{ "articles": [{ "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "Picture": { "id": "number", "url": "string" }, "categories": [{ "id": "number", "name": "string" }] }] }`

#### Récupérer un article spécifique (admin)

- **GET** `/api/articles/:id`
- Réponse: `{ "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "Picture": { "id": "number", "url": "string" }, "categories": [{ "id": "number", "name": "string" }] }`

#### Créer un article

- **POST** `/api/articles`
- Body: `{ "categoryName": ["string"], "name": "string", "description": "string", "price": "number", "available": "boolean", "pictureUrl": "string" }`
- Réponse: `{ "message": "Article créé avec succès", "article": { "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "picture_id": "number", "created_at": "date", "updated_at": "date" } }`

#### Mettre à jour un article

- **PATCH** `/api/articles/:id`
- Body: `{ "categoryName?": ["string"], "name?": "string", "description?": "string", "price?": "number", "available?": "boolean", "pictureUrl?": "string" }`
- Réponse: `{ "message": "Article mis à jour avec succès", "article": { "id": "number", "name": "string", "description": "string", "price": "number", "available": "boolean", "picture_id": "number", "created_at": "date", "updated_at": "date", "Picture": { "id": "number", "url": "string" }, "categories": [{ "id": "number", "name": "string" }] } }`

#### Supprimer un article

- **DELETE** `/api/articles/:id`
- Réponse: `{ message: "Article supprimé avec succès" }`

#### Récupérer toutes les commandes (admin)

- **GET** `/api/commandes`
- Réponse: `[{ "id": "number", "article_summary": "string", "date": "date", "total_price": "number" }]`

#### Récupérer les détails d'une commande (admin)

- **GET** `/api/commandes/:id`
- Réponse: `{ "id": "number", "article_summary": "string", "date": "date", "total_price": "number", "User": { "id": "number", "firstname": "string", "lastname": "string", "email": "string" }, "articles": [{ "id": "number", "name": "string", "price": "number", "ArticleHasOrder": { "quantity": "number" } }] }`

#### Récupérer le suivi d'une commande (admin)

- **GET** `/api/commandes/:id/suivi`
- Réponse: `{ "id": "number", "User": { "id": "number", "firstname": "string", "lastname": "string", "email": "string" }, "Tracking": { "id": "number", "status": "string" }, "articles": [{ "id": "number", "name": "string", "ArticleTrackings": [{ "status": "string", "growth": "string", "plant_place": "string", "Picture": { "id": "number", "url": "string" } }] }] }`

#### Récupérer le suivi d'un article spécifique d'une commande (admin)

- **GET** `/api/commandes/:orderId/suivi/:trackingId`
- Réponse: `{ "id": "number", "status": "string", "growth": "string", "plant_place": "string", "Picture": { "id": "number", "url": "string" }, "ArticleHasOrder": { "quantity": "number", "article_id": "number", "order_id": "number" } }`

#### Mettre à jour le suivi d'un article d'une commande (admin)

- **PATCH** `/api/commandes/:orderId/suivi/:trackingId`
- Body :
  
```json
{
  "status?": "string",
  "growth?": "string",
  "plant_place?": "string",
  "picture_url?": "string"
}
```

- Réponse:

```json
{
  "message": "Suivi d'article mis à jour avec succès",
  "articleTracking": {
    "id": "number",
    "status": "string",
    "growth": "string",
    "plant_place": "string",
    "picture_url": "string"
  }
}
```

### Pages statiques

#### Conditions Générales d'Utilisation

- **GET** `/conditions-generales-d-utilisation`
- Réponse: `{ message: "Conditions Générales d'Utilisation" }`

#### Conditions Générales de Vente

- **GET** `/conditions-generales-de-vente`
- Réponse: `{ message: "Conditions Générales de Vente }`

#### Mentions Légales

- **GET** `/mentions-legales`
- Réponse: `{ message: "Mentions légales" }`

### Exemples de requêtes et réponses

#### Inscription d'un nouvel utilisateur

### Codes d'état HTTP

- **200 OK**: La requête a réussi
- **201 Created**: La ressource a été créée avec succès
- **400 Bad Request**: La requête est invalide
- **401 Unauthorized**: Authentification nécessaire
- **403 Forbidden**: Accès refusé
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur
