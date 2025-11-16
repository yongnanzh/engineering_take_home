class Client < ApplicationRecord
  has_many :buildings, dependent: :destroy

  validates :name, presence: true

  # custom_fields is an array of objects stored in jsonb, each with:
  # { "key": "used_as_key", "type": "number|freeform|enum", "label": "Human", "options": ["opt1","opt2"] }
  # - number: decimal numbers (e.g., 2.5)
  # - freeform: arbitrary strings
  # - enum: one of a set of string options (provide `options` key)

  def custom_fields_map
    Array(self.custom_fields).each_with_object({}) do |cf, memo|
      memo[cf['key'].to_s] = cf
    end
  end
end
