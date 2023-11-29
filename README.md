# Gelato-NFT

Template project using Gelato VRF to generate randomized NFTs.

## Setup

1. Clone the repo
2. Install dependencies `yarn install`
3. Fill in `.env` with variables in `.env.example`

## Test

Run `yarn test`

## Deploy

```console
yarn deploy --tags IceCreamNFT --network ${network}
```

## Verify contract

```console
yarn verify --network ${network}
```

## Create a VRF task

```console
yarn createVRF --network ${network}
```

## Mint an IceCreamNFT

```console
yarn mint --network ${network}
```
