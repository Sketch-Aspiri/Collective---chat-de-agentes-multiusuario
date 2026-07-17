resource "aws_db_instance" "agentes_chat" {
  identifier             = "agentes-chat-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "agentes_chat"
  username               = "postgres"
  manage_master_user_password = true
  skip_final_snapshot    = true
}
