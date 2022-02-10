# Rockets NestJS Common

The common module is a dependency of all Rockets modules.

## Configuration

Available configuration options:

1. [Deferred Registration](#deferred-registration)

### Deferred Registration

By default, modules that are registered using `.deferred()` do not have a timeout set.

If you module wirings make some asynchronous calls that may experience significant delays during start up,
it is a good idea to set the global `ROCKETS_MODULE_DEFERRED_TIMEOUT` environment variable to the number of
milliseconds that each module should timeout at.

#### Examples

Your .env file:

```bash
# global deferred timeout
ROCKETS_MODULE_DEFERRED_TIMEOUT=5000
```

Your shell:

```bash
$ export ROCKETS_MODULE_DEFERRED_TIMEOUT=5000;
```
