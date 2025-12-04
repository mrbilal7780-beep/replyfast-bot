# 🚀 Configuration Stripe pour ReplyFast AI

Ce guide vous explique comment configurer Stripe pour gérer les abonnements mensuels avec essai gratuit de 14 jours.

## ✅ Étape 1 : Migration SQL dans Supabase

1. Connecte-toi à **Supabase Dashboard**
2. Va dans **SQL Editor**
3. Copie et exécute le contenu du fichier `stripe_migration.sql`
4. Vérifie que les tables sont créées :
   - Colonne `stripe_customer_id` ajoutée à `clients`
   - Colonne `stripe_subscription_id` ajoutée à `clients`
   - Colonne `subscription_status` ajoutée à `clients`
   - Table `payment_history` créée

---

## 🔑 Étape 2 : Variables d'environnement dans Render

Va sur **Render Dashboard** → **Environment Variables** et ajoute :

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<ta_clé_publique_stripe>

STRIPE_SECRET_KEY=<ta_clé_secrète_stripe>

NEXT_PUBLIC_META_APP_ID=1361686089075783
```

**Note** : Remplace `<ta_clé_publique_stripe>` et `<ta_clé_secrète_stripe>` par tes vraies clés depuis Stripe Dashboard → Développeurs → Clés API

---

## 🔗 Étape 3 : Configuration du Webhook Stripe

1. Va sur **Stripe Dashboard** → **Développeurs** → **Webhooks**
2. Clique sur **"Ajouter un endpoint"**
3. Entre l'URL du webhook :
   ```
   https://replyfast-bot.onrender.com/api/stripe-webhook
   ```
4. Sélectionne les événements suivants :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Clique sur **"Ajouter un endpoint"**
6. Copie le **Secret du webhook** (commence par `whsec_...`)
7. Retourne sur **Render** et ajoute la variable :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```

---

## 🌐 Étape 4 : Déploiement sur Render

1. Va sur **Render Dashboard**
2. Clique sur **"Manual Deploy"**
3. Sélectionne **"Clear build cache & deploy"**
4. Attends que le build soit terminé (5-10 minutes)

---

## ✨ Fonctionnalités implémentées

- ✅ **Essai gratuit de 14 jours** sans carte bancaire
- ✅ **Abonnement mensuel** à 19,99€
- ✅ **Paiements automatiques** via Stripe
- ✅ **Annulation en un clic** dans les paramètres
- ✅ **Historique des paiements** dans le dashboard
- ✅ **Gestion des échecs de paiement**
- ✅ **Webhooks** pour synchroniser les statuts

---

## 📊 Flux utilisateur

1. **Inscription** → Essai gratuit de 14 jours commence
2. **Période d'essai** → Bannière indique les jours restants
3. **Fin d'essai** → Invitation à s'abonner
4. **S'abonner** → Redirection vers Stripe Checkout
5. **Paiement** → Abonnement actif, facturation mensuelle

---

## 🧪 Test en mode Test Stripe

Si tu veux tester avant de passer en production :

1. Va sur **Stripe Dashboard** → Passe en **"Mode test"**
2. Remplace les clés dans Render par les clés de test :
   - `pk_test_...` au lieu de `pk_live_...`
   - `sk_test_...` au lieu de `sk_live_...`
3. Utilise la **carte de test Stripe** :
   - Numéro : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

---

## ❓ Problèmes courants

### Le webhook ne fonctionne pas
- Vérifie que l'URL est correcte : `https://replyfast-bot.onrender.com/api/stripe-webhook`
- Vérifie que le secret du webhook est bien configuré dans Render
- Vérifie les logs Stripe pour voir les erreurs

### L'abonnement ne se met pas à jour
- Vérifie que les événements webhook sont bien sélectionnés
- Vérifie les logs Render pour voir les erreurs API
- Vérifie que la table `clients` a bien les colonnes Stripe

### Erreur lors du checkout
- Vérifie que les clés Stripe sont correctes (mode test vs production)
- Vérifie les logs du navigateur (Console)
- Vérifie les logs Render

---

## 🎉 C'est tout !

Une fois tout configuré, ton site sera prêt à gérer les abonnements automatiquement.
