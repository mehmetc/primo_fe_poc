class CreateResults < ActiveRecord::Migration
  def self.up
    create_table :results do |t|
      t.string  :from_record
      t.string  :to_record
      t.references :query
      t.timestamps
    end
  end

  def self.down
    drop_table :results
  end
end
