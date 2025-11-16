module Api
  module V1
    class BuildingsController < ApplicationController
      skip_forgery_protection if respond_to?(:skip_forgery_protection)

      # GET /api/v1/buildings
      # Supports basic pagination via `page` and `limit` query params.
      def index
        page = [params.fetch(:page, 1).to_i, 1].max
        limit = [[params.fetch(:limit, 5).to_i, 1].max, 100].min

        buildings = Building.includes(:client).order(:id).limit(limit).offset((page - 1) * limit)

        payload = buildings.map do |b|
          client = b.client
          # ensure we return all custom field keys defined for the client, even if empty
          cf_map = client.custom_fields_map
          cf_values = (b.custom_field_values || {}).with_indifferent_access

          row = {
            'id' => b.id.to_s,
            'client_name' => client.name,
            'name' => b.name,
            'client_id' => b.client_id,
            'address' => b.respond_to?(:address) ? b.address : nil,
            'city' => b.city,
            'state' => b.state,
            'postal_code' => b.postal_code,
            'year_built' => b.year_built,
            'floors' => b.floors
          }

          cf_map.keys.each do |key|
            row[key] = cf_values.key?(key) && !cf_values[key].nil? ? cf_values[key].to_s : ''
          end

          row
        end

        total_count = Building.count
        total_pages = (total_count / limit.to_f).ceil

        render json: {
          status: 'success',
          buildings: payload,
          meta: { total_count: total_count, total_pages: total_pages, page: page, limit: limit }
        }, status: :ok
      end

      # PATCH/PUT /api/v1/buildings/:id
      # Same validation rules as create; allow changing client by providing `client_id`.
      def update
        building = Building.find_by(id: params[:id])
        unless building
          render json: { success: false, errors: ['building not found'] }, status: :not_found
          return
        end

        building_params = params.require(:building).permit(
          :client_id,
          :name,
          :address,
          :city,
          :state,
          :postal_code,
          :year_built,
          :floors,
          custom_field_values: {}
        )

        if building_params[:client_id]
          client = Client.find_by(id: building_params[:client_id])
          unless client
            render json: { success: false, errors: ['client_id not found'] }, status: :unprocessable_entity
            return
          end
          building.client = client
        end

        building.assign_attributes(building_params.except(:client_id))

        if building.save
          render json: { success: true, message: 'Building updated', building: building.as_json(only: [:id, :name, :client_id, :updated_at]) }, status: :ok
        else
          render json: { success: false, errors: building.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/buildings/:id
      def show
        building = Building.find_by(id: params[:id])
        unless building
          render json: { success: false, errors: ['building not found'] }, status: :not_found
          return
        end

        client = building.client
        render json: {
          success: true,
          building: building.as_json(only: [:id, :name, :client_id, :address, :city, :state, :postal_code, :year_built, :floors]).merge({ 'custom_field_values' => building.custom_field_values || {}, 'client_name' => client&.name })
        }, status: :ok
      end

      # POST /api/v1/buildings
      # Expected payload:
      # {
      #   "building": {
      #     "client_id": 1,
      #     "name": "101 Main St",
      #     "address": "101 Main St",
      #     "city": "Somewhere",
      #     "state": "NY",
      #     "postal_code": "12345",
      #     "year_built": 1980,
      #     "floors": 5,
      #     "custom_field_values": { "used_as_key": "value" }
      #   }
      # }
      def create
        building_params = params.require(:building).permit(
          :client_id,
          :name,
          :address,
          :city,
          :state,
          :postal_code,
          :year_built,
          :floors,
          custom_field_values: {}
        )

        client = Client.find_by(id: building_params[:client_id])
        unless client
          render json: { success: false, errors: ["client_id not found"] }, status: :unprocessable_entity
          return
        end

        building = client.buildings.new(building_params.except(:client_id))

        if building.save
          render json: { success: true, message: "Building created", building: building.as_json(only: [:id, :name, :client_id, :created_at]) }, status: :created
        else
          render json: { success: false, errors: building.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
