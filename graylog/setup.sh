# create directories for persistent data
mkdir -p mongo/data && chmod o+r+w mongo/data
mkdir -p opensearch/data && chmod o+r+w opensearch/data
mkdir -p graylog/data/config && chmod o+r+w -R graylog/data
# download Graylog config files (https://github.com/Graylog2/graylog-docker/tree/5.2/config)
wget -O graylog/data/config/graylog.conf https://raw.githubusercontent.com/Graylog2/graylog-docker/5.2/config/graylog.conf
wget -O graylog/data/config/log4j2.xml https://raw.githubusercontent.com/Graylog2/graylog-docker/5.2/config/log4j2.xml
# set Graylog node id (optional)
echo 'graylog_node_1' > graylog/data/config/node-id

