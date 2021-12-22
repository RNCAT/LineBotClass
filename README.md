# AlpacaShop Bot  

## How to use 

### Requirement
- [Node.js v16+](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
- [TMD Weather Forecast API](https://data.tmd.go.th/nwpapi/doc)

### Install dependencies

``` shell
$ yarn
```

### Configuration

``` js
// .env file

//default 3000
NODE_PORT = 5000

//LINE
CHANNEL_ACCESS_TOKEN = "xxx"
CHANNEL_SECRET = "xxx"

//TMD Weather Forecast API
WEATHER_ACCESS_TOKEN = "xxx" 
```

### Run

``` shell
$ yarn dev
```