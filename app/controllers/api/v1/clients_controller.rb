module Api
  module V1
    class ClientsController < ApplicationController
      skip_forgery_protection if respond_to?(:skip_forgery_protection)

      # GET /api/v1/clients
      def index
        clients = Client.order(:id).select(:id, :name, :custom_fields)
        render json: { status: 'success', clients: clients.as_json(only: [:id, :name, :custom_fields]) }, status: :ok
      end
    end
  end
end
