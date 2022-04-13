# Back-End
An Ideal back-end system solution should look like this

			Query Started <---------------------------------------------- 
			  |															| 
			  v															|
			Client -> Stored user? N -> Create user						|
			  |			  Y                  |							|
			  | <---------| <-----------------							|
			  v															|
			Request {user, ip} {req}									|
			  |															|
			  v															|
			Create token {user, ip}										|
			  |															|
			  v		    {token}  		  {token}					    |
			Server -> In Database? Y -> Blacklisted? N -> Query -> Send response {res}
						  N			      	Y    		   ^
						  |			    	|			   |
						  |					v			   |
						  v			       403			   |
						Add user --------------------------|
					{token, userId} // userId acts as salt, ip acts as password

Currently it looks like this
			Query started
			  |
			  v
			Client -> Stored user? N -> Create user
			  | 		  Y                  |
			  | <---------| <-----------------
			  v
			Request {user} {req}