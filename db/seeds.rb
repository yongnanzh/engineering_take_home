# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
#
# Seeds: create 5 clients, each with custom fields and example buildings
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup)
Client.transaction do
  Client.delete_all
  Building.delete_all

  clients_data = [
    {
      name: 'Alpha Properties',
      custom_fields: [
        { 'key' => 'num_bathrooms', 'type' => 'number', 'label' => 'Number of bathrooms' },
        { 'key' => 'primary_color', 'type' => 'freeform', 'label' => 'Primary color' },
        { 'key' => 'walkway', 'type' => 'enum', 'label' => 'Walkway type', 'options' => ['Brick', 'Concrete', 'None'] }
      ]
    },
    {
      name: 'Brick & Beam',
      custom_fields: [
        { 'key' => 'floor_area', 'type' => 'number', 'label' => 'Floor area (sqft)' },
        { 'key' => 'has_rooftop', 'type' => 'enum', 'label' => 'Rooftop', 'options' => ['None', 'Partial', 'Full'] }
      ]
    },
    {
      name: 'Concrete Co',
      custom_fields: [
        { 'key' => 'purchase_price', 'type' => 'number', 'label' => 'Purchase price' },
        { 'key' => 'architect_notes', 'type' => 'freeform', 'label' => 'Architect notes' }
      ]
    },
    {
      name: 'Downtown LLC',
      custom_fields: [
        { 'key' => 'has_parking', 'type' => 'enum', 'label' => 'Parking', 'options' => ['Street', 'Lot', 'Garage', 'None'] },
        { 'key' => 'units', 'type' => 'number', 'label' => 'Units' }
      ]
    },
    {
      name: 'Eco Habitats',
      custom_fields: [
        { 'key' => 'green_rating', 'type' => 'enum', 'label' => 'Green rating', 'options' => ['A','B','C','None'] },
        { 'key' => 'notes', 'type' => 'freeform', 'label' => 'Notes' }
      ]
    }
  ]

  clients_data.each_with_index do |cdata, i|
    client = Client.create!(name: cdata[:name], custom_fields: cdata[:custom_fields])

    # create 2 sample buildings per client with plausible custom_field_values
    2.times do |j|
      cfv = {}
      client.custom_fields.each do |cf|
        key = cf['key']
        case cf['type']
        when 'number'
          cfv[key] = (1 + j) * (i + 1) * 1.5
        when 'freeform'
          cfv[key] = "Sample text #{j + 1} for #{key}"
        when 'enum'
          options = Array(cf['options'])
          cfv[key] = options[j % options.length]
        end
      end

      client.buildings.create!(
        name: "#{client.name} Building #{j + 1}",
        address: "#{100 + j} #{['Main St', 'Broadway', 'Market'].sample}",
        city: 'Metropolis',
        state: 'NY',
        postal_code: format('%05d', 10000 + i * 10 + j),
        year_built: 1980 + j,
        floors: 1 + j,
        custom_field_values: cfv
      )
    end
  end
end

puts "Seeded #{Client.count} clients and #{Building.count} buildings"
