# BetVictor API

API for accessing sports betting data

## Version: 1.0.0

### /data

#### GET

##### Summary:

Retrieve sports betting data for all available languages

##### Responses

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 404  | No data available     |
| 500  | Internal server error |

### /sports

#### GET

##### Summary:

Retrieve available sports for all available languages

##### Responses

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 404  | No data available     |
| 500  | Internal server error |

### /{lang}/data

#### GET

##### Summary:

Retrieve sports betting data for the specified language

##### Parameters

| Name     | Located in | Description                            | Required | Schema |
| -------- | ---------- | -------------------------------------- | -------- | ------ |
| language | path       | The language code to retrieve data for | Yes      | string |

##### Responses

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 400  | Unsupported language  |
| 404  | No data available     |
| 500  | Internal server error |

### /{lang}/sports

#### GET

##### Summary:

Retrieve available sports for the specified language

##### Parameters

| Name     | Located in | Description                            | Required | Schema |
| -------- | ---------- | -------------------------------------- | -------- | ------ |
| language | path       | The language code to retrieve data for | Yes      | string |

##### Responses

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 400  | Unsupported language  |
| 404  | No data available     |
| 500  | Internal server error |

### /{lang}/event

#### GET

##### Summary:

Retrieve all available events for the specified language

##### Parameters

| Name     | Located in | Description                               | Required | Schema |
| -------- | ---------- | ----------------------------------------- | -------- | ------ |
| language | path       | The language code to retrieve data for    | Yes      | string |
| event    | query      | The event ID or name to retrieve data for | Yes      | string |

##### Responses

| Code | Description                 |
| ---- | --------------------------- |
| 200  | Successful response         |
| 400  | Unsupported language        |
| 400  | Event parameter is required |
| 404  | No data available           |
| 500  | Internal server error       |

### /{lang}/events

#### GET

##### Summary:

Retrieve available events for the specified language

##### Parameters

| Name     | Located in | Description                            | Required | Schema |
| -------- | ---------- | -------------------------------------- | -------- | ------ |
| language | path       | The language code to retrieve data for | Yes      | string |

##### Responses

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 400  | Unsupported language  |
| 404  | No data available     |
| 500  | Internal server error |

## Additional information

I have chosen to write this in typescript to display my capabilities even though it was not required, I have also chosen to include swagger in this project (at least the json). Testing was done with jest and data was retrieved with the first party node-fetch instead of http as it is a better first party module, I asked if this was allowed but unfortunately cannot get a response before deadline. Caching uses node-cache for its ease of use, it caches data for any language "allowed".

I have also used tsx to run as it is substantially easier than using node directly and I use pnpm as my package manager.

### How to run

    pnpm i
    pnpm start

    pnpm test
