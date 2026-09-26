# Confidentialité et contact — 26 septembre 2026

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

- Effacement ciblé des cookies `_ga` et `_ga_MN2KJN5SSK` et des anciennes préférences
  mensuelles `Bill_Cookies_…`. Aucune ancienne acceptation ne réactive un service.
  Les autres données du navigateur sont préservées ; un stockage bloqué ne casse pas
  la navigation. Cela n'efface pas les données historiques des serveurs de Google ou
  de FormSubmit.
- Blocage des connexions JavaScript, des formulaires et des iframes par CSP, avec
  protection HTML en complément des en-têtes Apache/Vercel. Pas de referrer envoyé
  aux liens externes.
- Clarification du contact : le lien e-mail ouvre le logiciel du visiteur, sans
  sécuriser le contenu de son message. Rendez-vous et détails médicaux par téléphone
  ou en personne ; aucune nouvelle collecte de données de santé sur le site.
- Information sur les candidatures avant contact, traitement des données de santé,
  destinataires, critères de conservation, droits et absence de profilage. Distinction
  entre les statistiques serveur IONOS et les traceurs navigateur ; information sur
  les adresses Vercel supplémentaires.
- Régressions sur visiteurs nouveaux/anciens, stockage bloqué, suppression ciblée et
  accès aux notices patients/candidats, en plus des contrôles du site existants.

## Vérification

Commandes : `npm ci`, `npm test`, `npm run build`, puis le job GitHub `Site checks / verify`
qui exécute également les tests navigateur sur le build (ordinateur et mobile).
Consulter le statut de la PR pour les résultats du commit final. Les tests n'envoient
aucun e-mail et ne contactent pas FormSubmit.

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
5. Vérifier le domaine public : `/`, `/datenschutz.html`, `/videos.html`, contact au
   clavier/sur mobile, absence d'appel à Google Analytics/FormSubmit, absence de faux
   succès, suppression des anciens cookies, en-têtes et liens. Tester un navigateur
   neuf puis un navigateur avec anciennes préférences. Purger un cache obsolète si
   nécessaire. Ne déclarer la correction publique qu'après ces contrôles.

Retour arrière : utiliser un commit correctif qui conserve la suppression de la
collecte et du tracking. Restaurer l'ancienne version en production réintroduirait
le problème ; ne pas réécrire l'historique Git.

## Fondements consultés

- [DSGVO, notamment art. 5, 6, 9, 13, 28 et 32](https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX%3A02016R0679-20160504)
- [§ 25 TDDDG — accès/stockage dans le terminal](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [§ 26 BDSG — candidatures et emploi](https://www.gesetze-im-internet.de/bdsg_2018/__26.html)
- [LfDI Rheinland-Pfalz — e-mails et secret professionnel](https://www.datenschutz.rlp.de/themen/e-mail-berufsgeheimnistraeger)
- [IONOS — intégration GitHub](https://docs.ionos.space/docs/git-integration/)
- [IONOS — statistiques serveur](https://docs.ionos.space/docs/visitor-statistics/)
- [Vercel — informations de confidentialité](https://vercel.com/legal/privacy-notice)

Ces modifications réduisent les risques techniques constatés et améliorent
l'information. Elles ne constituent pas une certification de conformité globale
des traitements de la Praxis ni des comptes d'hébergement.
