using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using EnvExplorer.Data.Model;
using EnvExplorer.Data.Model.Responses;

namespace EnvExplorer.Profiles;

public class ParametersProfile : Profile
{
    public ParametersProfile()
    {
        CreateMap<ParameterMetadata, ParameterMetadataResponse>()
            .ForMember(x => x.Name, x => x.MapFrom(src => src.Name))
            .ForMember(x => x.Type, x => x.MapFrom(src => src.Type.Value));

        CreateMap<Parameter, CachedParameter>()
            .ForMember(x => x.Name, x => x.MapFrom(src => src.Name))
            .ForMember(x => x.Type, x => x.MapFrom(src => src.Type.Value))
            .ForMember(x => x.LastModifiedDate, x => x.MapFrom(src => src.LastModifiedDate))
            .ForMember(x => x.Value, x => x.MapFrom(src => src.Value));
    }
}