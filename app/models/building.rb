class Building < ApplicationRecord
  belongs_to :client

  validates :name, :address, :city, :state, :postal_code, :year_built, :floors, presence: true
  validate :validate_building_fields
  validate :validate_custom_fields_against_client

  private

  def validate_building_fields
    %w[name address city state].each do |attr|
      val = self.send(attr)
      next if val.nil?

      # Ensure the value is a String (JSON numbers can arrive as integers/floats)
      unless val.is_a?(String)
        errors.add(attr.to_sym, 'must be a string')
        next
      end

      # Reject values that are purely numeric (e.g., "12345")
      if val.to_s.strip =~ /\A\d+\z/
        errors.add(attr.to_sym, 'must be a string')
      end
    end
  end

  def validate_custom_fields_against_client
    return unless client

    provided = (custom_field_values || {}).with_indifferent_access
    allowed = client.custom_fields_map

    # Check for unknown keys
    unknown = provided.keys - allowed.keys
    if unknown.any?
      errors.add(:custom_field_values, "contains unknown keys: #{unknown.join(', ')}")
      return
    end

    # Check types
    provided.each do |k, v|
      next unless allowed[k]
      expected_type = allowed[k]['type']

      case expected_type
      when 'freeform'
        unless v.is_a?(String)
          errors.add(:custom_field_values, "#{k} expected freeform/string")
        end
      when 'number'
        # Accept numeric types and numeric strings that parse as decimals
        unless v.is_a?(Numeric) || (v.is_a?(String) && Float(v) rescue false)
          errors.add(:custom_field_values, "#{k} expected number")
        end
      when 'enum'
        options = Array(allowed[k]['options']).map(&:to_s)
        unless v.is_a?(String) && options.include?(v.to_s)
          errors.add(:custom_field_values, "#{k} expected one of #{options.join(', ')}")
        end
      else
        errors.add(:custom_field_values, "#{k} has unsupported type #{expected_type}")
      end
    end
  end
end
