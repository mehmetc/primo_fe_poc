class SessionsController < ApplicationController
  def token
    respond_to do |wants| 
      wants.html {render :text => 'This is not implemented. Make sure your header is set to "application/json" ' }
      wants.json {render :json => {:authenticity_token => form_authenticity_token}.to_json}
    end    
  end
end