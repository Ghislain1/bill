# Confidentialité, contact et statistiques facultatives — 26 septembre 2026

## État constaté

Base de travail : `main`, commit `50ee6d951aa867e1b62dea031e51e98464e09274`.
Cette version avait déjà supprimé Google Analytics, FormSubmit et le faux message
d'envoi, remplacé la collecte par des contacts téléphone/e-mail et ajouté une page
Datenschutz. Ces corrections ne sont pas de nouvelles modifications de cette PR.

Le contrôle direct de https://bill-physio.de/ le 26 septembre retrouve encore le
formulaire POST vers FormSubmit, le script Google Analytics et aucun lien Datenschutz.
Aucune donnée de patient ni demande de test n'a été envoyée.

Le dernier déploiement IONOS de cette base échoue avant le build :
[exécution 36260269681](https://github.com/BillBidias/Bill-Physio/actions/runs/36260269681),
job `check readiness`, étape `Fetch project data`, erreur `Could not get input api-key`.
Le workflow attend `secrets.IONOS_API_KEY`. Sa valeur n'est pas disponible dans ce job.
L'absence de clé empêche actuellement de vérifier les étapes IONOS suivantes.

## Changements de cette PR

- À la demande de l'exploitant, réintroduction de Google Analytics uniquement après
  consentement explicite aux statistiques. Cette révision remplace la mesure initiale
  de suppression totale d'Analytics ; elle ne restaure pas l'ancien bandeau mensuel.
- Fenêtre en allemand : deux boutons équivalents pour accepter/refuser, fermeture
  et Échap valant refus, détails lisibles avant décision, bouton permanent
  `Cookie-Einstellungen`. Il s'agit d'un consentement aux statistiques, pas d'une
  acceptation globale de la politique de confidentialité.
- Mode de consentement **basique** : aucun chargement Google ni ping sans accord.
  Propriété conservée : `G-MN2KJN5SSK`. Activation limitée aux adresses HTTPS
  `bill-physio.de` et `www.bill-physio.de`, jamais sur les aperçus Vercel/locaux.
- À la demande de l’exploitant, chaque nouvelle entrée sur le site, actualisation,
  réouverture d’onglet ou retour d’historique affiche à nouveau le choix, même avec
  le cache conservé. Seuls les liens internes continuent la visite actuelle.
  L’accord/refus reste dans sessionStorage pour 30 minutes au maximum ; un marqueur
  de navigation à usage unique, valable 30 secondes, évite de redemander à chaque lien.
  Les cookies `_ga` et `_ga_MN2KJN5SSK` deviennent des cookies de session. Les anciennes
  préférences mensuelles et le précédent choix de 180 jours sont supprimés.
  Un stockage bloqué ou en lecture seule ne réactive jamais un ancien accord.
- Retrait : arrêt du tag, suppression ciblée des cookies, rechargement d'une page
  qui avait chargé Analytics, propagation des refus aux autres onglets déjà consentants
  et gestion de l’expiration. Un nouvel onglet doit donner son propre accord.
  Les autres données du navigateur restent intactes. Cela n'efface pas les données
  historiques des serveurs de Google ou de FormSubmit.
- Mesures de pages avec chemins connus et titres fixes, sans paramètres d'URL,
  fragments ou referrer. Publicité, Google Signals et personnalisation désactivés dans
  le code. **Les réglages de la propriété Google restent à vérifier ci-dessous.**
- CSP limitée aux hôtes Analytics nécessaires ; formulaires et iframes bloqués,
  protection HTML et en-têtes Apache/Vercel. Aucun referrer envoyé aux liens externes.
- Clarification du contact : le lien e-mail ouvre le logiciel du visiteur, sans
  sécuriser le contenu de son message. Rendez-vous et détails médicaux par téléphone
  ou en personne ; aucune nouvelle collecte de données de santé sur le site.
- Notice mise à jour pour Analytics, choix, cookies, retrait, transferts, candidatures,
  données de santé et droits. Distinction avec les statistiques serveur IONOS et
  information sur les adresses Vercel supplémentaires.

## Vérification

Commandes : `npm ci`, `npm test`, `npm run build`, puis le job GitHub `Site checks / verify`
qui exécute également les tests navigateur sur le build (ordinateur et mobile).
Consulter le statut de la PR pour les résultats du commit final. Les tests n'envoient
aucun e-mail et ne contactent pas FormSubmit. Les tests Analytics servent le vrai build
sur une origine de production simulée et interceptent tous les appels Google. Ils
vérifient le déclenchement, le contenu préparé, le refus, le retrait, plusieurs onglets,
l’expiration, le stockage indisponible, les nouvelles visites avec cache HTTP conservé
et les retours d’historique. Le chemin pageshow.persisted est également testé par un
événement simulé, car le navigateur CI peut désactiver son cache de navigation. Ils ne prouvent pas la réception d'événements
dans le compte Google ni la configuration distante de la propriété.

## Réglages Google à vérifier avant publication

L'accès d'administration Google Analytics n'est pas disponible ici. Le code ne peut
pas modifier ces réglages ni vérifier les accords de l'exploitant :

1. Vérifier que `G-MN2KJN5SSK` appartient à la bonne propriété et au bon flux Web.
2. Désactiver les **mesures améliorées** du flux, notamment formulaires, liens sortants,
   recherche et changements d'historique. Le code envoie une seule page vue explicite ;
   une configuration distante ne doit pas ajouter d'événements ou d'URL non nettoyées.
3. Désactiver Google Signals, collecte de données fournies par les utilisateurs,
   User-ID, publicité/remarketing, destinations Ads et partage avec les autres produits
   Google. Ne pas ajouter d'autre destination ou balise sans revoir le consentement.
4. Vérifier la durée réelle de conservation des données utilisateur/événement et la
   préciser dans `src/datenschutz.html` avant publication. Recommandation pour ce
   besoin de statistiques générales : **2 mois**, sans réinitialisation à chaque
   nouvelle activité. Les rapports agrégés ont un traitement distinct. La durée de
   30 minutes concerne le choix de visite, pas la conservation sur les serveurs Google.
   Le texte actuel donne un critère général ; la durée du compte n'a pas été inventée.
5. Vérifier l'accord de sous-traitance Google et les mécanismes de transfert applicables
   au compte ; compléter les informations nécessaires dans la notice. Les liens vers
   les conditions Google ne sont pas la preuve de leur acceptation par l'exploitant.
6. Après déploiement et avec consentement explicite, contrôler un événement dans le
   rapport temps réel. Une prévisualisation Vercel ne transmet volontairement rien.

## Déploiement et points qui exigent les accès de l'exploitant

1. Dans le projet IONOS Deploy Now **existant**, vérifier la connexion au dépôt
   `BillBidias/Bill-Physio` et au domaine, puis rétablir le secret GitHub Actions
   `IONOS_API_KEY` via l'intégration IONOS. Ne jamais coller la clé dans une issue,
   dans le code ou dans une conversation. Ne pas désactiver un contrôle de sécurité
   pour faire réussir le workflow. Aucun domaine, fournisseur ou contrat n'est changé
   par cette PR.
2. Confirmer le prestataire contractuel réel, les accords de sous-traitance (art. 28),
   les durées des logs/e-mails/candidatures et les transferts applicables à Vercel
   (art. 44 et suivants). Les critères généraux dans la notice ne constituent pas une
   vérification des réglages du compte ni la preuve d'un accord signé. Vérifier aussi
   si un délégué à la protection des données est désigné et, le cas échéant, publier
   son contact. Ces données administratives n'ont pas été inventées.
3. Contrôler les éventuelles anciennes demandes conservées par FormSubmit et Analytics
   et définir leur sort selon la finalité/les obligations applicables. La suppression
   du code ne prouve ni une fuite ni la suppression de données chez un prestataire.
4. Après revue et fusion, déployer `main`. Le dossier publié doit être `dist`, avec
   sa `.htaccess`, et pas `src`. Le site est statique : aucun serveur de formulaire ou
   identifiant SMTP n'est configuré. Un futur formulaire exige un traitement serveur
   adapté et vérifié, ainsi qu'une notice correspondant au traitement réel.
5. Vérifier le domaine public : `/`, `/datenschutz.html`, `/videos.html`, contact et
   fenêtre au clavier/sur mobile ; zéro appel Google avant choix/après refus ; activation
   uniquement après accord ; retrait et disparition des cookies ; zéro FormSubmit/faux
   succès ; en-têtes et liens. Tester un navigateur neuf puis un navigateur avec anciennes
   préférences. Purger un cache obsolète si nécessaire. Ne déclarer la correction publique
   qu'après ces contrôles.

Retour arrière : désactiver Analytics avec un commit correctif tout en conservant
la notice et les contacts sûrs. Ne pas restaurer le suivi sans consentement ou le
formulaire tiers ; ne pas réécrire l'historique Git.

## Fondements consultés

- [DSGVO, notamment art. 5, 6, 9, 13, 28 et 32](https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX%3A02016R0679-20160504)
- [§ 25 TDDDG — accès/stockage dans le terminal](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [§ 26 BDSG — candidatures et emploi](https://www.gesetze-im-internet.de/bdsg_2018/__26.html)
- [LfDI Rheinland-Pfalz — e-mails et secret professionnel](https://www.datenschutz.rlp.de/themen/e-mail-berufsgeheimnistraeger)
- [IONOS — intégration GitHub](https://docs.ionos.space/docs/git-integration/)
- [IONOS — statistiques serveur](https://docs.ionos.space/docs/visitor-statistics/)
- [Vercel — informations de confidentialité](https://vercel.com/legal/privacy-notice)
- [Google — mode de consentement basique](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google — désactivation et publicité](https://developers.google.com/tag-platform/security/guides/privacy)
- [Google — configuration des cookies et mesures](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [Google — conservation des données](https://support.google.com/analytics/answer/7667196?hl=de)
- [Google — données contractuelles et transferts](https://business.safety.google/adsprocessorterms/)

Ces modifications réduisent les risques techniques constatés et améliorent
l'information. Elles ne constituent pas une certification de conformité globale
des traitements de la Praxis ni des comptes d'hébergement.

## Retour du pop-up et cache

Le cache HTTP et le consentement sont indépendants. Les pages HTML demandent une
revalidation, les ressources statiques peuvent rester en cache. Une nouvelle entrée
ignore tout ancien accord, même si le navigateur restaure sessionStorage ; un retour
depuis le cache de navigation réinitialise également le tag et la fenêtre. Les liens
internes gardent le choix du visiteur. Le rechargement interne effectué pour retirer
un consentement conserve le refus, sans ouvrir immédiatement une nouvelle demande.
La notice de confidentialité et l'accès direct à l'Impressum restent accessibles
sans fenêtre automatique.

## Étape 2 — accès à l'Impressum et compléments de notice, 27 septembre 2026

À la demande de l'exploitant, cette intervention porte uniquement sur l'étape 2
de l'évaluation. Base : `main`, commit `7be56d70365132c48a51380e8d2c679fb0cb1500`.
Les modifications de présentation déjà présentes dans cette base sont conservées.

- Un lien direct vers `index.html#impressum` figure dans la fenêtre cookies.
  Il ferme la fenêtre sans enregistrer de consentement ou de refus. La section
  dispose d'une cible de focus au clavier. Un accès direct, un rechargement ou
  une restauration de cette section n'ouvre pas automatiquement la fenêtre.
- Les réglages restent accessibles depuis le pied de page. Les boutons de choix,
  la durée de 30 minutes, le retour de la demande lors d'une nouvelle visite et
  les règles d'activation de Google Analytics conservent leur fonctionnement.
- La notice précise les identités publiques des prestataires, les catégories de
  données de contact, les bases supplémentaires pour les données de santé
  (§ 22 BDSG et secret professionnel), la distinction entre les traitements de
  Vercel pour ses clients et ceux en propre, l'obtention des garanties de transfert,
  les droits des personnes, le délai de réponse et le recours auprès du LfDI.
- Les tests navigateur couvrent le lien depuis chaque page avec fenêtre automatique,
  sa réouverture sur la même ancre, l'absence de choix implicite ou d'appel Google,
  les retours de navigation et la conservation d'un refus préexistant. Ils utilisent
  le build réel avec les requêtes externes interceptées, sur ordinateur et mobile.

**Informations dépendantes de l'étape 3 :** les durées effectivement configurées
chez Google et chez les prestataires, les contrats de sous-traitance, les mécanismes
de transfert applicables au compte et l'éventuelle désignation d'un DPO restent à
confirmer. Les adresses publiques des fournisseurs ne prouvent pas l'identité du
cocontractant dans un compte donné. Le DPA publié par Vercel indique s'appliquer
aux clients Pro et Enterprise : vérifier le plan et les clauses effectivement
applicables avant de présenter cet accord comme acquis. La notice ne prétend pas
qu'un contrat a été signé ni qu'une durée inconnue a été vérifiée. Ses critères
généraux de conservation doivent être précisés dès réception de ces informations.

Aucun réglage de compte, fournisseur, formulaire, secret IONOS ou déploiement de
production n'est modifié par cette étape. La branche et son aperçu Vercel permettent
la revue ; la mise en ligne sur bill-physio.de et sa vérification restent distinctes.

Sources complémentaires consultées le 27 septembre 2026 :

- [DSK — orientation services numériques, notamment accès aux mentions légales, § 121](https://www.datenschutzkonferenz-online.de/media/oh/OH_Digitale_Dienste.pdf)
- [§ 22 BDSG — données sensibles et mesures de protection](https://www.gesetze-im-internet.de/bdsg_2018/__22.html)
- [§ 203 StGB — secret professionnel](https://www.gesetze-im-internet.de/stgb/__203.html)
- [IONOS — identité du fournisseur](https://www.ionos.de/impressum)
- [Google — identité et informations de confidentialité](https://policies.google.com/privacy?hl=de)
- [Vercel — Data Processing Addendum et périmètre contractuel](https://vercel.com/legal/dpa)
- [LfDI Rheinland-Pfalz — contact](https://www.datenschutz.rlp.de/service/kontakt)
- [LfDI Rheinland-Pfalz — plainte](https://www.datenschutz.rlp.de/themen/online-services/beschwerdeformular)
