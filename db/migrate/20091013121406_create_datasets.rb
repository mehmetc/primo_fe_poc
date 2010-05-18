class CreateDatasets < ActiveRecord::Migration
  def self.up
    create_table :datasets do |t|
      t.string  :type
      t.string  :name
      t.string  :label
      t.string  :description
      t.boolean :active, :default => true
      t.integer :load, :default => 10
      t.timestamps
    end
  end

  def self.down
    drop_table :datasets
  end
end
