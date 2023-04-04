scripts_dir="$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"
cd "${scripts_dir}/.."
cp mattel.env .env
mkcert test-virtual.mattel.com
