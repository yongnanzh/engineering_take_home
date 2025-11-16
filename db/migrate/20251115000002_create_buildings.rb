class CreateBuildings < ActiveRecord::Migration[7.0]
  def change
    create_table :buildings do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name, null: false
      t.string :address
      t.string :city
      t.string :state
      t.string :postal_code
      t.integer :year_built
      t.integer :floors
      t.jsonb :custom_field_values, null: false, default: {}

      t.timestamps
    end
    add_index :buildings, :client_id unless index_exists?(:buildings, :client_id)
    add_index :buildings, :postal_code unless index_exists?(:buildings, :postal_code)
    add_index :buildings, :custom_field_values, using: :gin unless index_exists?(:buildings, :custom_field_values, using: :gin)
  end
end
