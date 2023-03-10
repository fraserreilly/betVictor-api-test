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

| Code | Description           |
| ---- | --------------------- |
| 200  | Successful response   |
| 400  | Unsupported language  |
| 404  | No data available     |
| 500  | Internal server error |

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

### components
