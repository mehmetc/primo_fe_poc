class CreateResultDatas < ActiveRecord::Migration
  def self.up
    create_table :result_datas do |t|
      t.string  :key
      t.string  :value
      t.references :result
      t.timestamps
    end
  end

  def self.down
    drop_table :result_datas
  end
end
