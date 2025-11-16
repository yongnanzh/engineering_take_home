class CreateClients < ActiveRecord::Migration[7.0]
  def change
    create_table :clients do |t|
      t.string :name, null: false
      t.jsonb :custom_fields, null: false, default: []

      t.timestamps
    end
    add_index :clients, :name unless index_exists?(:clients, :name)
  end
end
