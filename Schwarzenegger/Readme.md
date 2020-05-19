# Schwarzenegger project

- Claim alapú hitelesítés (Role és ahhoz tartozó permission-ök)
- IsAdmin: Mindenhez joga van (User property)
- csak Api szinten operálni a Userekkel.
- Userhez csak role-t lehet most adni, egyedi UserClaim-et nem.
- Timeout funkció
- Remember me funkció

# TODO

- Konfiguráció
- Lapozott lekérdezések Devextrem Datagrid-ekhez
- User-hez lehessen UserClaim-et (Claim) felvenni
- Kód duplikációkat felszámolni
  - Backend
  - Frontend
- Felesleges kódot törölni
- Stringeket Enumokba szervezni
- Testek írása

# Első indítás
Package Manager Consol-ba:
- Add-Migration InitialPersistedGrantDbContext -Context PersistedGrantDbContext -Output Migrations
- Add-Migration InitialConfigurationDbContext -Context ConfigurationDbContext -Output Migrations