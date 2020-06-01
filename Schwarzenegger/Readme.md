# Schwarzenegger project

- Claim alapú hitelesítés (Role és ahhoz tartozó permission-ök)
- IsAdmin: Mindenhez joga van (User property)
- csak Api szinten operálni a Userekkel.
- Userhez csak role-t lehet most adni, egyedi UserClaim-et nem.
- Timeout funkció
- Remember me funkció

# TODO

- Konfiguráció
- Hibaüzenetek normálisan szövegben jelenjenek meg
  - minden hibaüzenet a backendtől le legyen kezelve
- Lapozott lekérdezések Devextrem Datagrid-ekhez
- User-hez lehessen UserClaim-et (Claim) felvenni
- Kód duplikációkat felszámolni
  - Backend
  - Frontend
- Felesleges kódot törölni
- Stringeket Enumokba szervezni
- Testek írása
- Disconnect jelző

# Követelmények

- Node.js
- PostgreSQL
 - ef_demo Password01

# Első indítás

client-app mappán (npm i) parancs

tanúsítványokat rendberakni: http://www.codepro.co.nz/blog/2019/10/setup-vue-js-with-https-certificate/

Package Manager Consol-ba:
- Add-Migration InitialPersistedGrantDbContext -Context PersistedGrantDbContext -Output Migrations
- Add-Migration InitialConfigurationDbContext -Context ConfigurationDbContext -Output Migrations