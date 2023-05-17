# Local Development

# Setup Cubejs locally first time

1. Create file: apps/cubejs/.env
2. Credentials: https://linuxfoundation.1password.com/vaults/all/allitems/bo262ucfapve3ynop7ldygagdy
3. From root folder run:

```bash
yarn install
yarn cube
```

Optinal you can run frontend and cubejs together

```bash
yarn start
```

Open http://localhost:4000/


## How to test

1. Run Cubejs locally at the port 4000
2. Run crowdev db tunnel
3. Run yarn test

### apps/cubejs/.env file example

```
CUBEJS_DEV_MODE=true
CUBEJS_EXTERNAL_DEFAULT=true
CUBEJS_SCHEDULED_REFRESH_DEFAULT=true
CUBEJS_WEB_SOCKETS=true
CUBEJS_DATASOURCES=default,redshiftlfx
CUBEJS_API_SECRET=
CUBEJS_DB_HOST=amazonaws.com
CUBEJS_DB_PORT=
CUBEJS_DB_NAME=
CUBEJS_DB_USER=
CUBEJS_DB_PASS=
CUBEJS_DB_TYPE=
CUBEJS_DS_REDSHIFTLFX_DB_HOST=
CUBEJS_DS_REDSHIFTLFX_DB_PORT=
CUBEJS_DS_REDSHIFTLFX_DB_NAME=
CUBEJS_DS_REDSHIFTLFX_DB_USER=
CUBEJS_DS_REDSHIFTLFX_DB_PASS=
CUBEJS_DS_REDSHIFTLFX_DB_TYPE=
```
