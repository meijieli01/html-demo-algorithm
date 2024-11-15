#include <comTool/pmpDefine.h>
#include <iostream>
#include <comTool/DaoaoFilter.h>

#include <string>
#include <malloc.h>
#include <functional>


#include "emscripten.h"
#include <emscripten/val.h>
#include <emscripten/bind.h>
#include <emscripten/heap.h>
#include <emscripten/em_asm.h>
using namespace emscripten;

using namespace std;
using namespace pmp;

class DirectDaoao {
public:
	DirectDaoao(){}
	~DirectDaoao(){}

	void setMesh(const std::vector<float>& verts, const std::vector<int>& faces) {
		m_mesh.faces.clear();
		m_mesh.vertices.clear();
		const int vnum = verts.size() / 3;
		const int fnum = faces.size() / 3;
		for (int i = 0; i < vnum;i++) {
			Eigen::Vector3f p(verts[3*i+0], verts[3 * i + 1], verts[3 * i + 2]);
			m_mesh.vertices.push_back(p);
		}
		for (int i = 0; i < fnum; i++) {
			Eigen::Vector3i f(faces[3 * i + 0], faces[3 * i + 1], faces[3 * i + 2]);
			m_mesh.faces.push_back(f);
		}
		
		
		
	}
	
	std::string mesh2string(const Mesh& mesh) {
		std::stringstream ofs;
		ofs << "OFF" << std::endl;
		ofs << m_mesh.vertices.size() << " " << m_mesh.faces.size() << " 0" << std::endl;
		for (auto v : m_mesh.vertices)
		{
			ofs << v[0] << " " << v[1] << " " << v[2] << std::endl;
		}

		for (auto f : m_mesh.faces)
		{
			ofs << "3 " << f[0] << " " << f[1] << " " << f[2] << std::endl;
		}
		return ofs.str();
	}
	
	void writeInitMesh(){
		std::cout<<mesh2string(m_mesh)<<std::endl;
	}
	
	void writeDaoao(const float voxelSize = 0.05f){
		MESH_TYPE type = MESH_TYPE::DAOAO_SELECT;
		m_daoao.run(m_mesh, m_dir, voxelSize, type);
		auto faces = m_daoao.selectFaces();
		Mesh out;
		out.vertices = m_mesh.vertices;
		for (int fix : faces) {
			out.faces.push_back(m_mesh.faces[fix]);
		}
		std::cout<<mesh2string(out)<<std::endl;
	}

	bool setDirect(const std::vector<float>& dir) {
		const int num = dir.size();
		const int dim = 3;
		if (num != dim)
			return false;
		for (int i = 0; i < dim;i++) {
			m_dir[i] = dir[i];
		}
		return true;
	}

	std::vector<int> getDaoaoFaceIdxs(const float voxelSize = 0.05f) {
		MESH_TYPE type = MESH_TYPE::DAOAO_SELECT;
		m_daoao.run(m_mesh,m_dir,voxelSize,type);
		return m_daoao.selectFaces();
	}

private:
	DaoaoFilter m_daoao;
	pmp::Mesh m_mesh;
	pmp::Dir m_dir{0,0,-1};
};

EMSCRIPTEN_BINDINGS(module)
{
	register_vector<int>("VectorInt");
	register_vector<float>("VectorFloat");

	class_<DirectDaoao>("DirectDaoao")
		.constructor<>()
		.function("setMesh", &DirectDaoao::setMesh)
		.function("setDirect", &DirectDaoao::setDirect)
		.function("getDaoaoFaceIdxs", &DirectDaoao::getDaoaoFaceIdxs)
		.function("writeInitMesh", &DirectDaoao::writeInitMesh)
		.function("writeDaoao", &DirectDaoao::writeDaoao)
		;
}

