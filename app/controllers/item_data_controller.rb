class ItemDataController < ApplicationController  
  def show
     doc_number = params[:id]
     p = {}
     
     begin
       if doc_number.nil?
         p = {'error' => 'no document number found'}
       else
         p = PrimoSearchHolding.new(doc_number, @@OPAC_HOST, @@OPAC_BASE).items     
       end
     rescue Exception => e
       p = {'error' => e.message}
     end     
     
     respond_to do |wants|
       wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" ' }
       wants.json { render :json => p.to_json }
     end
  end
  
end
