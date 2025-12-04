# 📱 GUIDE COMPLET - Configuration WhatsApp Business avec META

## 🎯 Vue d'ensemble

Ce guide vous explique **étape par étape** comment configurer WhatsApp Business API avec Meta pour votre application ReplyFast AI, en utilisant les **5 numéros de test gratuits** fournis par Meta.

---

## 📋 PRÉ-REQUIS

Avant de commencer, assurez-vous d'avoir :

✅ Un compte Facebook Business Manager
✅ Un compte Meta for Developers
✅ Un numéro de téléphone pour vérification (pas WhatsApp)
✅ Accès à votre serveur ReplyFast (URL publique HTTPS)
✅ 5 numéros de téléphone de bêta-testeurs

---

## ÉTAPE 1 : Créer une application Meta

### 1.1 - Aller sur Meta for Developers

🔗 **URL :** https://developers.facebook.com

1. **Connectez-vous** avec votre compte Facebook
2. Cliquez sur **"Mes applications"** (en haut à droite)
3. Cliquez sur **"Créer une application"**

### 1.2 - Sélectionner le type d'application

1. Choisissez : **"Business"**
2. Cliquez sur **"Suivant"**

### 1.3 - Remplir les informations

```
Nom de l'application : ReplyFast AI
Email de contact : votre@email.com
Application commerciale : [Sélectionnez votre Business Manager]
```

4. Cliquez sur **"Créer une application"**

### 1.4 - Vérification de sécurité

Meta peut demander une vérification (captcha ou mot de passe).

✅ **Votre App ID est créé !**

Exemple : `1361686089075783` (déjà dans votre `.env`)

---

## ÉTAPE 2 : Activer WhatsApp Business API

### 2.1 - Ajouter le produit WhatsApp

1. Dans le tableau de bord de votre app
2. Cherchez **"WhatsApp"** dans la liste des produits
3. Cliquez sur **"Configurer"**

### 2.2 - Configurer le compte WhatsApp Business

Meta va vous demander de créer ou sélectionner un **WhatsApp Business Account (WABA)**.

**Options :**
- **Créer un nouveau compte** (recommandé pour les tests)
- **Utiliser un compte existant**

✅ Cliquez sur **"Créer un compte professionnel"**

**Informations à renseigner :**
```
Nom du compte : ReplyFast AI
Fuseau horaire : Europe/Paris (ou votre fuseau)
Devise : EUR
```

✅ Cliquez sur **"Suivant"**

---

## ÉTAPE 3 : Ajouter un numéro WhatsApp (Test)

### 3.1 - Sélectionner "Ajouter un numéro de téléphone"

Meta propose **2 options** :

1. **Utiliser un numéro Meta hébergé** ✅ (RECOMMANDÉ pour test)
2. **Utiliser votre propre numéro**

**Choisissez Option 1** pour débuter avec un numéro test gratuit.

### 3.2 - Numéro de téléphone test

Meta fournit **GRATUITEMENT** :
- ✅ **1 numéro de téléphone test**
- ✅ **Possibilité d'envoyer des messages à 5 numéros** (vos bêta-testeurs)

**Le numéro sera au format :**
```
+1 555-XXX-XXXX (US)
```

ou

```
+44 XXXX XXXXXX (UK)
```

✅ **Notez ce numéro** - vous en aurez besoin pour la configuration !

### 3.3 - Récupérer le Phone Number ID

1. Allez dans **WhatsApp → API Setup**
2. Vous verrez :
   - **Phone Number** : Le numéro complet
   - **Phone Number ID** : `1234567890` (exemple)

✅ **IMPORTANT : Copiez le Phone Number ID** (pas le numéro complet)

**Exemple :**
```
Phone Number : +1 555-123-4567
Phone Number ID : 938427616001036  ← CELUI-CI !
```

---

## ÉTAPE 4 : Ajouter vos 5 numéros de test (bêta-testeurs)

### 4.1 - Aller dans l'onglet "Numéros de test"

1. Dans **WhatsApp → API Setup**
2. Descendez jusqu'à **"Numéros de téléphone du destinataire"**

### 4.2 - Ajouter les 5 numéros

Cliquez sur **"+ Gérer les numéros de téléphone"**

**Format à respecter :**
```
Format international sans espaces ni tirets
Exemple : +33612345678
```

**Ajoutez vos 5 bêta-testeurs :**
```
Numéro 1 : +33612345678
Numéro 2 : +33687654321
Numéro 3 : +33601020304
Numéro 4 : +33698765432
Numéro 5 : +33611223344
```

✅ Cliquez sur **"Enregistrer"**

### 4.3 - Vérifier les numéros

Chaque numéro reçoit un **code de vérification par SMS**.

**Demandez à vos bêta-testeurs** d'entrer leur code reçu par SMS.

✅ Une fois validés, les 5 numéros peuvent **recevoir et envoyer** des messages !

---

## ÉTAPE 5 : Obtenir le Token d'accès (Access Token)

### 5.1 - Générer un token temporaire (24h)

1. Dans **WhatsApp → API Setup**
2. Cherchez **"Access Token temporaire"**
3. Cliquez sur **"Copier"**

**Exemple :**
```
EAAhQI5U4XJQBOzMpvKZC2dGdAZA3Iv5Lc...
```

⚠️ **Ce token expire dans 24h** - utile pour les tests uniquement.

### 5.2 - Générer un token permanent (PRODUCTION)

Pour la production, vous devez créer un **System User Token** :

1. Allez dans **Business Settings**
2. **Utilisateurs → Utilisateurs système**
3. Cliquez sur **"Ajouter"**
4. Nom : `ReplyFast System User`
5. Rôle : **Administrateur**
6. Cliquez sur **"Créer un utilisateur système"**

**Générer le token :**
1. Cliquez sur **"Générer un nouveau token"**
2. App : Sélectionnez **ReplyFast AI**
3. Permissions :
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
4. Durée : **60 jours** ou **Jamais** (production)
5. Cliquez sur **"Générer un token"**

✅ **COPIEZ ET SAUVEGARDEZ** ce token immédiatement (il ne sera plus visible).

**Format du token :**
```
EAAhQI5U4XJQBOzMpvKZC2dGdAZA3Iv5Lc... (très long)
```

---

## ÉTAPE 6 : Configurer les Webhooks

Les webhooks permettent de recevoir les messages entrants en temps réel.

### 6.1 - URL de votre webhook

Votre serveur ReplyFast doit être accessible publiquement en HTTPS.

**Format de l'URL :**
```
https://votre-domaine.com/api/whatsapp-webhook
```

**Exemples :**
```
https://replyfast-bot.onrender.com/api/whatsapp-webhook
https://replyfast.vercel.app/api/whatsapp-webhook
https://api.replyfast.com/api/whatsapp-webhook
```

### 6.2 - Créer un Verify Token

C'est un mot de passe secret pour sécuriser votre webhook.

**Générez-en un aléatoire :**
```bash
openssl rand -hex 32
```

**Exemple de verify token :**
```
e8f7a2b9c4d6e1f3a8b7c9d2e4f6a1b3c5d7e9f1a3b5c7d9e2f4a6b8c1d3e5f7
```

✅ **Notez-le** - vous en aurez besoin dans Meta ET dans votre `.env` !

### 6.3 - Configurer le webhook dans Meta

1. Dans **WhatsApp → Configuration**
2. Cliquez sur **"Modifier"** à côté de "Callback URL"

**Remplissez :**
```
Callback URL : https://votre-domaine.com/api/whatsapp-webhook
Verify Token : e8f7a2b9c4d6e1f3a8b7c9d2e4f6a1b3c5d7e9f1a3b5c7d9e2f4a6b8c1d3e5f7
```

✅ Cliquez sur **"Vérifier et enregistrer"**

**Meta va envoyer une requête GET à votre serveur avec :**
```
GET /api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=VOTRE_TOKEN&hub.challenge=RANDOM_STRING
```

**Votre serveur doit répondre avec `hub.challenge`.**

### 6.4 - S'abonner aux événements webhook

Cochez **TOUS** ces événements :
```
✅ messages
✅ message_status
✅ messaging_product
```

✅ Cliquez sur **"Enregistrer"**

---

## ÉTAPE 7 : Configuration de votre fichier `.env`

Maintenant que vous avez tous les tokens, mettez-les dans votre fichier `.env`.

### 7.1 - Ouvrir `/home/user/replyfast-bot/.env`

```bash
# Meta WhatsApp Business API
NEXT_PUBLIC_META_APP_ID=1361686089075783

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=938427616001036  # ← Phone Number ID (ÉTAPE 3.3)
WHATSAPP_ACCESS_TOKEN=EAAhQI5U4XJQBOzMpvKZC2...  # ← Access Token (ÉTAPE 5)
WHATSAPP_VERIFY_TOKEN=e8f7a2b9c4d6e1f3a8b7c9d2e4f6a1b3...  # ← Verify Token (ÉTAPE 6.2)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (pour le bot IA)
OPENAI_API_KEY=sk-proj-...

# Stripe
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... ou pk_live_...

# Google Places API (autocomplete)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...
```

✅ **Sauvegardez le fichier**

---

## ÉTAPE 8 : Tester l'envoi de message

### 8.1 - Utiliser l'API Graph de Meta

Meta fournit un **Graph API Explorer** pour tester directement.

🔗 **URL :** https://developers.facebook.com/tools/explorer

**Configuration :**
1. Application : **ReplyFast AI**
2. User or Page : **Votre WABA**
3. Permissions : `whatsapp_business_messaging`

### 8.2 - Envoyer un message test

**Endpoint :**
```
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
```

**Headers :**
```json
{
  "Authorization": "Bearer {WHATSAPP_ACCESS_TOKEN}",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "messaging_product": "whatsapp",
  "to": "+33612345678",
  "type": "text",
  "text": {
    "body": "Bonjour ! Ceci est un message de test depuis ReplyFast AI 🚀"
  }
}
```

✅ Cliquez sur **"Submit"**

**Réponse attendue :**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "+33612345678",
    "wa_id": "33612345678"
  }],
  "messages": [{
    "id": "wamid.HBgLMzM2MTIzNDU2NzgVAgARGBI5..."
  }]
}
```

✅ **Votre bêta-testeur reçoit le message sur WhatsApp !**

### 8.3 - Tester la réception de message (webhook)

Demandez à un bêta-testeur d'**envoyer un message** au numéro WhatsApp test.

**Exemple :**
```
Bêta-testeur envoie : "Bonjour ReplyFast"
```

**Votre webhook reçoit :**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "messages": [{
          "from": "33612345678",
          "id": "wamid.HBgLMzM2MTIzNDU2NzgVAgARGBI5...",
          "timestamp": "1701234567",
          "text": {
            "body": "Bonjour ReplyFast"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

✅ **Vérifiez dans vos logs serveur** que le message est bien reçu.

---

## ÉTAPE 9 : Passer en production (après tests)

### 9.1 - Vérification du compte professionnel

Meta exige une vérification pour passer en production :

1. Allez dans **Business Settings → Sécurité**
2. Cliquez sur **"Commencer la vérification"**

**Documents requis :**
- Pièce d'identité
- Justificatif d'entreprise (Kbis, SIRET, etc.)
- Site web de l'entreprise

⏳ **Délai : 1 à 3 jours ouvrés**

### 9.2 - Augmenter les limites de messagerie

Par défaut, Meta limite à :
- **50 messages / jour** (compte non vérifié)
- **1 000 messages / jour** (compte vérifié)
- **10 000+ messages / jour** (sur demande)

**Pour augmenter :**
1. **Business Settings → WhatsApp Accounts**
2. Sélectionnez votre WABA
3. **Messaging limits**
4. Demandez une augmentation

### 9.3 - Ajouter un numéro de production

Pour utiliser votre propre numéro WhatsApp :

1. **WhatsApp → Phone Numbers**
2. Cliquez sur **"Ajouter un numéro de téléphone"**
3. Choisissez **"Utiliser mon propre numéro"**

**Conditions :**
- ✅ Le numéro NE DOIT PAS être utilisé sur WhatsApp classique
- ✅ Vous devez avoir accès aux SMS (pour vérification)
- ✅ Le numéro sera **migré vers WhatsApp Business API**

⚠️ **ATTENTION :** Une fois migré, vous ne pourrez plus utiliser ce numéro sur l'app WhatsApp classique.

---

## ÉTAPE 10 : Monitoring et logs

### 10.1 - Logs des messages

Meta fournit des logs détaillés :

**Accès :**
1. **WhatsApp → Analytics**
2. **Logs des messages**

**Vous pouvez voir :**
- Messages envoyés / reçus
- Statuts de livraison
- Erreurs
- Taux de lecture

### 10.2 - Webhooks logs

Vérifiez que vos webhooks fonctionnent :

1. **WhatsApp → Configuration → Webhooks**
2. Cliquez sur **"Tester"**

Meta envoie un événement test. Vérifiez vos logs serveur.

---

## 🐛 TROUBLESHOOTING

### Problème 1 : "Invalid Access Token"

**Cause :** Token expiré ou incorrect

**Solution :**
1. Régénérez un token (ÉTAPE 5)
2. Mettez à jour votre `.env`
3. Redémarrez votre serveur

### Problème 2 : "Webhook verification failed"

**Cause :** Verify token incorrect ou URL non accessible

**Solution :**
1. Vérifiez que votre URL est accessible en HTTPS
2. Vérifiez que le `WHATSAPP_VERIFY_TOKEN` dans `.env` correspond à celui dans Meta
3. Testez manuellement :
   ```bash
   curl "https://votre-domaine.com/api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=VOTRE_TOKEN&hub.challenge=test123"
   ```
   **Réponse attendue :** `test123`

### Problème 3 : "Message not delivered"

**Cause :** Numéro non autorisé ou limite atteinte

**Solution :**
1. Vérifiez que le numéro est dans les 5 numéros de test
2. Vérifiez les limites de messagerie (ÉTAPE 9.2)
3. Vérifiez les logs dans Meta

### Problème 4 : "Phone Number ID not found"

**Cause :** Mauvais Phone Number ID

**Solution :**
1. Allez dans **WhatsApp → API Setup**
2. Copiez le bon **Phone Number ID** (pas le numéro complet)
3. Mettez à jour `.env`

---

## 📋 CHECKLIST FINALE

Avant de lancer en production, vérifiez :

```
✅ App Meta créée
✅ WhatsApp Business API activé
✅ Numéro test configuré
✅ 5 numéros de bêta-testeurs ajoutés et vérifiés
✅ Access Token généré (permanent)
✅ Webhook configuré et vérifié
✅ Événements webhook activés (messages, message_status)
✅ Fichier .env rempli correctement
✅ Test d'envoi de message réussi
✅ Test de réception de message réussi
✅ Logs serveur actifs
✅ Compte Meta vérifié (pour production)
```

---

## 🚀 PROCHAINES ÉTAPES

Une fois tout configuré :

1. **Testez avec vos 5 bêta-testeurs**
   - Envoi de messages
   - Réception de messages
   - Détection de rendez-vous par l'IA
   - Notifications

2. **Optimisez l'expérience**
   - Templates de messages
   - Réponses automatiques
   - Intégration avec votre DB

3. **Passez en production**
   - Vérification du compte
   - Numéro de production
   - Augmentation des limites

---

## 📞 SUPPORT

**Meta Support :**
- 🔗 https://developers.facebook.com/support
- 📧 Via Business Help Center

**Documentation officielle :**
- 🔗 https://developers.facebook.com/docs/whatsapp
- 🔗 https://developers.facebook.com/docs/graph-api

**ReplyFast AI :**
- 📧 Consultez `DOCUMENTATION_TECHNIQUE.md` pour les détails d'intégration

---

**Dernière mise à jour :** 1er décembre 2025
**Version :** 1.0.0
