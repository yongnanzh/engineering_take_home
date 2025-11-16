# Background
We are building a platform that stores a list of physical buildings. Stakeholders will interact with our application via API.  We will have two types of stakeholders:
* Clients that submit and create / edit buildings that they own
* External clients that read all buildings from an API

Additionally, we want to allow functionality that allows clients to have custom fields to their buildings. For example, some clients may want their buildings to have an attribute that designates if a building used to be a church.

We do not want clients to modify this custom field configuration; it should be left purely within the database.

# SQL Database Schema
## Clients
* Clients are the main application clients. They submit buildings to the API and have the buildings associated with them.
* Has a name associated with the client

## Buildings
* Buildings are used to represent physical buildings
* Has basic address info: Address / State / Zip etc
* Additional information provided by Custom Fields
* Associated with Client

## Custom Field configuration
* Custom Fields are associated with a single client
* Custom Fields can be one of 3 types: number, freeform, or enum
  * Number fields can be any decimal number (e.g., Number of bathrooms: 2.5)
  * Freeform fields are strings (e.g., Living room color: “Blue”)
  * Enum is a choice of strings (e.g., Type of walkway: “Brick, Concrete, or None”)

Seed the clients table with 5 clients. You can name the clients anything you wish. 

Seed a small sample of custom fields for each client.

Seed a small sample of buildings for each client that contain values for the custom fields.

Please create indexes that make sense for the application.

# External APIs:
## Create Building
* Create a single Building associated with a client
* Return an error and do not save if any values were sent that were incorrect.
* Example: Send a string as a number field or a key that doesn't work with the custom fields
* Return a success message if it is saved correctly

## Edit Building
* Same constraints as creating but editing an existing building by targeting its primary id

## Read Buildings
* Returns all the buildings
* Support basic pagination functionality
* Returns the address information associated with each building
* Returns the client's name
* Returns the custom fields associated with each building, even if they are empty

Simplified read building output:

```
{
  "status": "success",
  "buildings": [
    {
      "id": "1",
      "client_name": "rock_walls_only",
      "address": "45 Main St",
      "rock_wall_size": "15",
      "rock_wall_length": "26"
    },
    {
      "id": "2",
      "client_name": "brick_walls_only",
      "address": "123 Side St",
      "brick_color": "red",
      "brick_count": ""
    }
  ]
}
```

# React Frontend
* Fetch all building data via API call and display each building in a card component written in React.
* Use React components to create a new building and edit an existing building, complete with the necessary API calls.
* Use of React hooks to manage state.

# Setup
This repository was setup using the latest Ruby on Rails via:

```
rails new engineering_take_home -d postgresql  -j=esbuild -T
```

Once you've downloaded the project the easiest way to run it is with Docker. After installing docker locally:

```
docker compose build
docker compose up
```

If everything works correctly, then you should be able to hit http://localhost:3000/ and see a welcome page with a simple React component.

If you want to run specs, you can run Rspec with from within the Docker container:

```
RAILS_ENV=test bundle exec rspec
```

## Run migration and seed the DB

```
docker compose -f docker-compose.yml up -d --build db && 
docker compose -f docker-compose.yml run --rm web bin/rails db:migrate && 
docker compose -f docker-compose.yml run --rm web bin/rails db:seed
```

## Build and start service

```
docker compose -f docker-compose.yml up -d --build web
```

## Stop service

```
docker compose -f docker-compose.yml down
```

# Demo
![Screenshot 2025-11-16 at 4 34 49 PM](https://github.com/user-attachments/assets/543e1813-494c-467b-903d-0858afc22163)
