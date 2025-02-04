export const usersVersionUpgrades = [
    {
        toVersion: 1,
        statements: [
          `CREATE TABLE IF NOT EXISTS user (
            userid integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            firstname varchar(40) NOT NULL,
            lastname varchar(40) NOT NULL,
            email varchar(40) NOT NULL,
            pwa varchar(40) NOT NULL,
            birthday varchar(40) NOT NULL,
            company varchar(40) NOT NULL,
          );`,
          `CREATE INDEX user_index_empid ON user (userid);`,
        ]
    },
  ]
  