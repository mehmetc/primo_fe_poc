# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#   
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Major.create(:name => 'Daley', :city => cities.first)
User.create(:username => 'guest')
LocalDataset.create(:label => 'K.U.Leuven', :name => 'KUL', :description => 'K.U.Leuven Local Metadata', :load => 10)
RemoteDataset.create(:label => 'TESTSET PRIMO', :name => 'TESTSET PRIMO', :description => 'Metalib test quickset for Limo', :load => 10)
RemoteDataset.create(:label => 'Biomedical Sciences', :name => 'Biomedical Sciences', :description => '', :load => 10)
RemoteDataset.create(:label => 'Humanities', :name => 'Humanities', :description => '', :load => 10)
RemoteDataset.create(:label => 'Science and Technology', :name => 'Science and Technology', :description => '', :load => 10)
RemoteDataset.create(:label => 'Bioscience and engineering', :name => 'Bioscience and engineering', :description => '', :load => 10)
RemoteDataset.create(:label => 'Arts', :name => 'Arts', :description => '', :load => 10)
RemoteDataset.create(:label => 'Social Sciences', :name => 'Social Sciences', :description => '', :load => 10)
RemoteDataset.create(:label => 'Web of Science', :name => 'Web of Science', :description => '', :load => 10)
