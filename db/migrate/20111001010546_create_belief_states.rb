class CreateBeliefStates < ActiveRecord::Migration
  def self.up
    create_table :belief_states do |t|
      t.integer :user_id,         :null => false
      t.integer :element_id,      :null => false
      t.string  :believed_state,  :null => false
      t.boolean :archived,        :default => false

      t.timestamps
    end
    
    add_index :belief_states, :user_id
    add_index :belief_states, :element_id
  end

  def self.down
    drop_table :belief_states
  end
end
