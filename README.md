# aws-basic
1. Install AWS CLI on the WSL ubuntu ⇒ `sudo apt install awscli`
2. Check if AWS exist ⇒ `aws --version`
3. Create an access key from the AWS web UI, choose AWS CLI when creating
4. Configure (connect to the AWS account):
`aws configure` ⇒ this will ask for access key and secret access key (this is the only time that the secret access key will be asked. It can also ask the region name if none is specified, also the default output format
    

### Some commands

- `aws ec2 describe-regions` ⇒ this is to getall the regions, but only after we configure aws on the CLI (like sign in to the account using access key)
- `aws ec2 describe-images --filter "Name=name, Values=amzn-ami*" --query "Images[0].ImageId" --output text` ⇒ here we use filter and query. Also if there is no output text then it will print out in json format
- `aws ec2 help` ⇒ to get all commands