atom_feed(:schema_date => '2008-04-22') do |feed|
  feed.title(@query.to_s)  
  feed.updated(@query.created_at)
  i=0
  @response[:records][:data].each do |record|
    
    feed.entry(record, {:url => build_url(record, i, @page), :id => record['id'], :updated => Time.new}) do |entry|
      entry.title(record['title'])
      
        entry.author do |author|        
          author.name(record['author'])
        end
      
      entry.contributor(record['contributor'])
      entry.content(record['content'])
      entry.content(record['description'])
    end
    i += 1
  end
end

