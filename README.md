# CoCDiceBot-Node

A Twitter Bot that returns CoCDice that can be used on Nodejs.
This repository is a modification of the repository (Python) at the following URL so that it can run on Nodejs.

[Negima1072/CoCDiceTwitterBot](https://github.com/Negima1072/CoCDiceTwitterBot)

## Sample

The program of this repository is running on the following Twitter account. You can reply or send a direct message.

[Twitter@ダイスボットちゃん](https://twitter.com/CoC_dicebot)

## Response

This bot will reply to Twitter replies and direct messages. BCDice basic commands and CoC7th commands are available. For example,

```
User> @Bot 1d100
Bot > @User (1D100) ＞ 83

User> @Bot cc<=50
Bot > @User (1D100<=50) ボーナス・ペナルティダイス[0] ＞ 1 ＞ 1 ＞ クリティカル
```

## How to Deploy

Here, Twitter and Vercel preparations are written separately, but please proceed in order depending on the situation.

### Twitter Preparation

1. Create a Project and App on the [TwitterDeveloperPortal](https://developer.twitter.com/en/portal/projects-and-apps). Set the permission to `Read and write and Direct message` and set the `Callback URI`.

2. Register the App created above in `Account Activity API / Sandbox` which is one of the [DevEnvironments](https://developer.twitter.com/en/account/environments) of PremiumAPI. Please note that you can only register one per account.

3. Register webhooks and subscriptions using [this API reference](https://developer.twitter.com/en/docs/twitter-api/premium/account-activity-api/api-reference/aaa-premium). Please note that you can only register one for each account. If you want to change it, you need to erase it once.

### Vercel Preparation

1. Deploy to Vercel from the button below.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNegima1072%2FCoCDiceTwitterBot-Node)


2. Register the key and secret for using TwitterAPI in the environment variables.

   ```
   CONSUMER_KEY=****************
   CONSUMER_SECRET=**************************
   ACCESS_TOKEN_KEY=****************************
   ACCESS_TOKEN_SECRET=*************************************
   ```

3. Complete!!! Use your Twitter Bot!!!

## License

This repository is available under the MIT license. Check the respective pages for other libraries.

## Author

Negima1072 ([Twitter@Negima1072](https://twitter.com/Negima1072))
