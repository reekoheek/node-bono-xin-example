# node-bono-xin-example

Example archetype to initiate web application utilize Node.js, Bono and Xin.

## Migration

Upgrade to latest

```sh
npm run migrate -- up
```

Downgrade to earliest

```sh
npm run migrate -- down
```

Reset to empty

```sh
npm run migrate -- reset
```

See other commands

```sh
npm run migrate
```

## Development

```sh
npm i
npm run migrate -- reset
npm run migrate -- up
npm run dev
```

## Production

```sh
npm i
npm run build
npm start
```
