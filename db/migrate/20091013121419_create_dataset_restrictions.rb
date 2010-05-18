class CreateDatasetRestrictions < ActiveRecord::Migration
  def self.up
    create_table :dataset_restrictions do |t|
      t.string  :from_ip
      t.string  :to_ip
      t.references :dataset
      t.timestamps
    end
  end

  def self.down
    drop_table :dataset_restrictions
  end
end
