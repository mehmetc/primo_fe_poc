#!/usr/bin/env ruby
ENV["RAILS_ENV"] = "development"
require File.expand_path(File.dirname(__FILE__) + "/../config/environment")

require 'activerecord'  
require 'reliable-msg' 


class Poller
    attr_reader :queue
    def initialize
      @queue = ReliableMsg::Queue.new('Primo')
    end
  
  
    def listen
        message = nil
        while message.nil? do
          message = @queue.get
        end
        puts "got message"
        message
    end
    
    def parse(query_id, result)
        query = Query.find(query_id)
        facets = []
        records = []
        
        result[:facets].each do |f|
          datas = []
          facet = Facet.create(:query => query, :name => f[:name], :total => f[:count])
          f[:data].each do |d|
            datas << DataKeyValue.create(:data_wrapper => facet, :key => d[:key], :value => d[:value])
          end
          facet.data_key_values = datas
          facets << facet
        end
        
        result[:records][:data].each do |d|
          datas = []        
          record = Record.create(:query       => query, 
                                 :total       => result[:records][:total], 
                                 :from_record => result[:records][:from],
                                 :to_record   => result[:records][:to] )
          d.each do |k,v|
              if v.class.to_s.eql?('Array')
                v.each do |sv|
                  datas << DataKeyValue.new(:data_wrapper => record, :key => k, :value => sv) unless sv.nil?
                end
              else
                datas << DataKeyValue.new(:data_wrapper => record, :key => k, :value => v) unless v.nil?                
              end

          end
          record.data_key_values = datas
          
          records << record
        end        
        
       query.data_wrappers << records
       query.data_wrappers << facets

       query.save
    end  

end



p = Poller.new

while true 
  message = p.listen
  p.parse(message.object[:query_id], message.object[:data])
end
