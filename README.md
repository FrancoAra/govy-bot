# govy-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Probot app

## Decision Flow

### Assigning influence points

## Development

### Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

### Docker

```sh
# 1. Build container
docker build -t govy-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> govy-bot
```

## Contributing

If you have suggestions for how govy-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2021 Francisco Miguel Aramburo Torres <atfm05@gmail.com>
