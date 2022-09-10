# KF Backend Test

## Setup

### Installing dependencies

Yarn must be installed on the node version used.
The supported node version is specified in the `.nvmrc` file.
To automatically switch to this version, if using `nvm`, run `nvm use`.

```yarn
yarn
```

Scaffolding environment

```bash
cp .env.example .env
```

Fill in your API key within the newly created `.env` file.

### Run Program

```yarn
yarn start
```

### Run Tests

```yarn
yarn test
```

## Design Decisions

### Filtering Outages

The functions for filtering outages were separated out with a nod to potential reusability.
Including the logic in one filter function would mean more work if for example the program needed
to just remove outages beginning before a given date in the future.
This approach of segregating the functions would facilitate this.

### Retry and Exponential Backoff

Part of the brief was to account for intermittent 500 errors.
API calls use an `exponential-backoff` mechanism with 3 maximum retries
in order to account for temporal issues.

This technique will only be applied when the error is an error which is not known in the context
of the request e.g. making numerous attempts to an endpoint returning a 404 will not help
with program execution.

Using this technique, it will until a defined maximum, keep attempting the request
at increasing intervals (configured as 2x each time).
Should it reach the maximum number of attempts, the program will terminate and error accordingly.
