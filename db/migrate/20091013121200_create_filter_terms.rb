class CreateFilterTerms < ActiveRecord::Migration
  def self.up
    create_table :filter_terms do |t|
      t.string  :term
      t.string  :index
      t.string  :match     
      t.integer :sequence 
      t.references :query
      t.timestamps
    end
  end

  def self.down
    drop_table :filter_terms
  end
end
