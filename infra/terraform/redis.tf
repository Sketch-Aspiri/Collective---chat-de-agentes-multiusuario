resource "aws_elasticache_cluster" "agentes_chat" {
  cluster_id           = "agentes-chat-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
}
