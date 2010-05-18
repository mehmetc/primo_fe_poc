class CreateQueries < ActiveRecord::Migration
  def self.up
    create_table :queries do |t|
      t.string     :state, :default => 'idle'
      t.integer    :total_records
      t.string     :user_ip
      t.references :database
      t.references :user
      t.string     :session_id
      t.timestamps
    end
  end

  def self.down
    drop_table :queries
  end
end
