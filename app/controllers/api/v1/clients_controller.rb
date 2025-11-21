module Api
  module V1
    class ClientsController < ApplicationController
      skip_forgery_protection if respond_to?(:skip_forgery_protection)

      # GET /api/v1/clients
      def index
        clients = Client.order(:id).select(:id, :name, :custom_fields)
        render json: { status: 'success', clients: clients.as_json(only: [:id, :name, :custom_fields]) }, status: :ok
      end

      # GET /api/v1/clients/:id
      def show
        client = Client.find_by(id: params[:id])
        building = Building.where(client_id: params[:id])
        total_count = building.count
        puts building.inspect

        unless client
          render json: { success: false, errors: ['client not found'] }, status: :not_found
          return
        end

        render json: {
          success: true,
          client: client.as_json(only: [:id, :name, :custom_fields]).merge({'total_count' => total_count})
        }, status: :ok
      end
    end
  end
end
