# Ardefact Configuration System

## Configuration variables
|key|description|
| --- | --- |
| ARDEFACT_RUN_MODE | Determines where to load config from. |
| ARDEFACT_EXEC_NPM | Absolute path to npm executable. |
| ARDEFACT_EXEC_NODE | Absolute path to the node executable.
| ARDEFACT_DEBUG_MODE | Output more mesages if truthy. |
| ARDEFACT_MONGODB_CONNECT_URL | Connection URL.  `mongodb://localhost:27017/test` in vagrant. |
| ARDEFACT_WEB_URL_ROOT | URL root for the website.  such as `ardefact.com` or `localhost/test/ardefact` |
| ARDEFACT_BCRYPT_WORK_FACTOR | How many rounds of bcrypting to use when bcrypting. |

## Run mode

Run mode is defined by `ARDEFACT_RUN_MODE` ENV var.  If it's absent, default to `vagrant`.

## Getting config value

 * Load config file from `cfg/{run mode}.json`.
 * If requested config key is present as an ENV var, return that.  Otherwise return value from loaded config file.
 
## Example usage

```
const ArdefactConfig = require('ardefact_config');

const mongoUrl = ArdefactConfig.getConfig(ArdefactConfig.CONFIG_VARS.ARDEFACT_MONGODB_CONNECT_URL);
```
